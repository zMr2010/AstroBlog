---
title: Template of FHQ-Treap
published: 2026-05-19 21:19:57
description: non-rotate Treap
tags: [FHQ-Treap, Balanced Tree]
category: Template
draft: false
slug: '202605192119'
---

written by ChatGPT.

```cpp
#include <iostream>
#include <memory>
#include <vector>
#include <array>
#include <cstdint>

template <typename Tp>
using OwnPtr = std::unique_ptr<Tp>;
template <typename Tp>
using RefPtr = Tp*;

class FhqTreap {
private:
    struct Node {
        std::array<RefPtr<Node>, 2> son{nullptr, nullptr};
        int cnt = 0, val = 0, sz = 0;
        std::uint32_t pri = 0;
    };

    std::vector<OwnPtr<Node>> pool;

    std::uint32_t seed = 114514;

    auto rnd() -> std::uint32_t {
        seed ^= seed << 13;
        seed ^= seed >> 17;
        seed ^= seed << 5;
        return seed;
    }

    auto size(RefPtr<Node> x) -> int {
        return x ? x->sz : 0;
    }

    void pushUp(RefPtr<Node> x) {
        if (!x) return;
        x->sz = x->cnt + size(x->son[0]) + size(x->son[1]);
    }

    auto newNode(int v) -> RefPtr<Node> {
        pool.push_back(std::make_unique<Node>());
        auto p = pool.back().get();

        p->val = v;
        p->cnt = p->sz = 1;
        p->pri = rnd();

        return p;
    }

    /*
        equal == false:
            x: val < v
            y: val >= v

        equal == true:
            x: val <= v
            y: val > v
    */
    void split(
        RefPtr<Node> p,
        int v,
        RefPtr<Node>& x,
        RefPtr<Node>& y,
        bool equal = false
    ) {
        if (!p) {
            x = y = nullptr;
            return;
        }

        if (p->val < v || (equal && p->val == v)) {
            x = p;
            split(p->son[1], v, x->son[1], y, equal);
            pushUp(x);
        } else {
            y = p;
            split(p->son[0], v, x, y->son[0], equal);
            pushUp(y);
        }
    }

    auto merge(RefPtr<Node> x, RefPtr<Node> y) -> RefPtr<Node> {
        if (!x || !y) {
            return x ? x : y;
        }

        if (x->pri < y->pri) {
            x->son[1] = merge(x->son[1], y);
            pushUp(x);
            return x;
        } else {
            y->son[0] = merge(x, y->son[0]);
            pushUp(y);
            return y;
        }
    }

    auto kth(RefPtr<Node> x, int k) -> RefPtr<Node> {
        while (x) {
            int ls = size(x->son[0]);

            if (k <= ls) {
                x = x->son[0];
            } else if (k <= ls + x->cnt) {
                return x;
            } else {
                k -= ls + x->cnt;
                x = x->son[1];
            }
        }

        return nullptr;
    }

    auto rightMost(RefPtr<Node> x) -> RefPtr<Node> {
        if (!x) return nullptr;
        while (x->son[1]) x = x->son[1];
        return x;
    }

    auto leftMost(RefPtr<Node> x) -> RefPtr<Node> {
        if (!x) return nullptr;
        while (x->son[0]) x = x->son[0];
        return x;
    }

public:
    RefPtr<Node> rt = nullptr;

    FhqTreap() = default;

    ~FhqTreap() {
        clear();
    }

    void clear() {
        rt = nullptr;
        std::vector<OwnPtr<Node>>().swap(pool);
        seed = 114514;
    }

    void insert(int v) {
        RefPtr<Node> a = nullptr;
        RefPtr<Node> b = nullptr;
        RefPtr<Node> c = nullptr;

        split(rt, v, a, b, false); // a < v, b >= v
        split(b, v, c, b, true);   // c == v, b > v

        if (c) {
            c->cnt++;
            pushUp(c);
        } else {
            c = newNode(v);
        }

        rt = merge(merge(a, c), b);
    }

    bool remove(int v) {
        RefPtr<Node> a = nullptr;
        RefPtr<Node> b = nullptr;
        RefPtr<Node> c = nullptr;

        split(rt, v, a, b, false); // a < v, b >= v
        split(b, v, c, b, true);   // c == v, b > v

        if (!c) {
            rt = merge(a, b);
            return false;
        }

        if (c->cnt > 1) {
            c->cnt--;
            pushUp(c);
        } else {
            auto del = c;
            c = merge(c->son[0], c->son[1]);

            del->son[0] = del->son[1] = nullptr;
            del->cnt = del->sz = 0;
        }

        rt = merge(merge(a, c), b);
        return true;
    }

    int find_rank(int v) {
        RefPtr<Node> a = nullptr;
        RefPtr<Node> b = nullptr;

        split(rt, v, a, b, false); // a < v, b >= v

        int ans = size(a) + 1;

        rt = merge(a, b);
        return ans;
    }

    int find_kth(int k) {
        if (!rt || k <= 0 || k > rt->sz) return -1;

        auto x = kth(rt, k);
        return x ? x->val : -1;
    }

    int find_prev(int v) {
        RefPtr<Node> a = nullptr;
        RefPtr<Node> b = nullptr;

        split(rt, v, a, b, false); // a < v, b >= v

        auto x = rightMost(a);
        int ans = x ? x->val : -1;

        rt = merge(a, b);
        return ans;
    }

    int find_next(int v) {
        RefPtr<Node> a = nullptr;
        RefPtr<Node> b = nullptr;

        split(rt, v, a, b, true); // a <= v, b > v

        auto x = leftMost(b);
        int ans = x ? x->val : -1;

        rt = merge(a, b);
        return ans;
    }
};

auto main() -> int {
    int T;
    std::cin >> T;

    FhqTreap treap;

    while (T--) {
        int op, x;
        std::cin >> op >> x;

        switch (op) {
            case 1:
                treap.insert(x);
                break;
            case 2:
                treap.remove(x);
                break;
            case 3:
                std::cout << treap.find_rank(x) << '\n';
                break;
            case 4:
                std::cout << treap.find_kth(x) << '\n';
                break;
            case 5:
                std::cout << treap.find_prev(x) << '\n';
                break;
            case 6:
                std::cout << treap.find_next(x) << '\n';
                break;
        }
    }

    return 0;
}
```