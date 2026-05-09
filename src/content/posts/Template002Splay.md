---
title: Template of Splay Tree
published: 2026-05-09 20:20:57
description: Security Template
tags: [Splay, Balanced Tree]
category: Template
draft: false
slug: '202605092020'
---

Security template of Splay Tree is coming~

```cpp
#include <iostream>
#include <memory>
#include <vector>
#include <array>
#include <cassert>

template <typename Tp>
using OwnPtr = std::unique_ptr<Tp>;
template <typename Tp>
using RefPtr = Tp*;

class Splay {
private:
    struct Node {
        std::array<RefPtr<Node>, 2> son{nullptr, nullptr};
        RefPtr<Node> fat = nullptr;
        int cnt = 0, val = 0, sz = 0;
    };
    std::vector<OwnPtr<Node>> pool;

    auto dir(RefPtr<Node> x) -> int {
        assert(x && x->fat);
        return x == x->fat->son[1];
    }
    void pushUp(RefPtr<Node> x) {
        x->sz = x->cnt;
        if (x->son[0]) x->sz += x->son[0]->sz;
        if (x->son[1]) x->sz += x->son[1]->sz;
    }
    auto newNode(int v, RefPtr<Node> fat = nullptr) -> RefPtr<Node> {
        pool.push_back(std::make_unique<Node>());
        auto p = pool.back().get();
        p->fat = fat, p->val = v, p->cnt = p->sz = 1;
        return p;
    }

    void rotate(RefPtr<Node> x) {
        auto y = x->fat;
        auto z = y->fat;
        int r = dir(x);
        int d = z ? dir(y) : 0;
        y->son[r] = x->son[!r];
        if (x->son[!r]) x->son[!r]->fat = y;
        x->son[!r] = y;
        if (z) z->son[d] = x;
        else rt = x;
        y->fat = x;
        x->fat = z;
        pushUp(y);
        pushUp(x);
    }

    void splay(RefPtr<Node> x) {
        if (!x) return ;
        while (x->fat) {
            auto y = x->fat;
            auto z = y->fat;
            if (z) {
                if (dir(x) == dir(y)) rotate(y);
                else rotate(x);
            }
            rotate(x);
        }
        rt = x;
    }

    void find(int v) {
        auto x = rt;
        auto y = (RefPtr<Node>)nullptr;
        for (; x && x->val != v; y = x, x = x->son[v > x->val]);
        splay(x ? x : y);
    }

    void loc(int k) {
        auto x = rt;
        while (x) {
            int ls = x->son[0] ? x->son[0]->sz : 0;
            if (k <= ls) {
                x = x->son[0];
            } else if (k <= ls + x->cnt) {
                break;
            } else {
                k -= ls + x->cnt;
                x = x->son[1];
            }
        }
        if (x) splay(x);
    }

    auto merge(RefPtr<Node> x, RefPtr<Node> y) -> RefPtr<Node> {
        if (!x || !y) {
            if (x) return x;
            return y;
        }
        rt = y;
        loc(1);
        rt->son[0] = x;
        x->fat = rt;
        pushUp(rt);
        return rt;
    }

public:
    RefPtr<Node> rt = nullptr;

    Splay() = default;
    ~Splay() {
        clear();
    }
    void clear() {
        rt = nullptr;
        std::vector<OwnPtr<Node>>().swap(pool);
    }

    void insert(int v) {
        auto x = rt, y = static_cast<RefPtr<Node>>(nullptr);
        for (; x && x->val != v; y = x, x = x->son[v > x->val]);
        if (x) x->cnt++, x->sz++;
        else {
            x = newNode(v, y);
            if (y) y->son[v > y->val] = x;
            else rt = x;
        }
        splay(x);
    }

    bool remove(int v) {
        find(v);
        if (!rt || rt->val != v) return false;
        rt->cnt--, rt->sz--;
        if (!rt->cnt) {
            auto x = rt->son[0];
            auto y = rt->son[1];
            if (x) x->fat = nullptr;
            if (y) y->fat = nullptr;
            rt = merge(x, y);
        }
        return true;
    }

    int find_rank(int v) {
        find(v);
        if (!rt) return 1;
        return (rt->son[0] ? rt->son[0]->sz : 0) + (rt->val < v ? rt->cnt : 0) + 1;
    }

    int find_kth(int k) {
        if (!rt || k <= 0 || k > rt->sz) return -1;
        loc(k);
        return rt->val;
    }

    int find_prev(int v) {
        find(v);
        if (!rt) return -1;
        if (rt->val < v) return rt->val;
        auto x = rt->son[0];
        if (!x) return -1;
        for (; x->son[1]; x = x->son[1]);
        splay(x);
        return rt->val;
    }

    int find_next(int v) {
        find(v);
        if (!rt) return -1;
        if (rt->val > v) return rt->val;
        auto x = rt->son[1];
        if (!x) return -1;
        for (; x->son[0]; x = x->son[0]);
        splay(x);
        return rt->val;
    }
};

auto main() -> int {
    int T;
    std::cin >> T;
    Splay splay;
    while (T--) {
        int op, x;
        std::cin >> op >> x;
        switch (op) {
            case 1:
                splay.insert(x);
                break;
            case 2:
                splay.remove(x);
                break;
            case 3:
                std::cout << splay.find_rank(x) << '\n';
                break;
            case 4:
                std::cout << splay.find_kth(x) << '\n';
                break;
            case 5:
                std::cout << splay.find_prev(x) << '\n';
                break;
            case 6:
                std::cout << splay.find_next(x) << '\n';
                break;
        }
    }
    return 0;
}
```