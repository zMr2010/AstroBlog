---
title: Template of Aho-Corasick AutoMaton
published: 2026-04-06 22:14:49
description: meaningful
tags: [String]
category: Template
draft: false
slug: '202604062214'
---

I learned *Ownner Pointer* and *Reference Pointer* today, and use them to write a safe template of ACAM.

The process of algorithm is needless to say.

```cpp
template <typename Tp>
using OwnPointer = std::unique_ptr<Tp>;
template <typename Tp>
using RefPointer = Tp*;

constexpr int MAXN = 6;
constexpr int ALPHABET = 26;

class ACAM {
public:
    explicit ACAM(const std::vector<std::string>& set) {
        Build(set);
    }
private:
    struct TrieNode {
        std::array<RefPointer<TrieNode>, ALPHABET> ch;
        RefPointer<TrieNode> fail;
        bool is_taboo;

        TrieNode() {
            ch.fill(nullptr);
            fail = nullptr;
            is_taboo = false;
        }
    };
    std::vector<OwnPointer<TrieNode>> node_pool;
    RefPointer<TrieNode> root;

    RefPointer<TrieNode> NewNode() {
        node_pool.emplace_back(std::make_unique<TrieNode>());
        return node_pool.back().get();
    }

    void Insert(const std::string& s) {
        RefPointer<TrieNode> now = root;
        for(const char& c : s) {
            int id = c-'a';
            if(!now->ch[id]) {
                now->ch[id] = NewNode();
            }
            now=now->ch[id];
        }
        now->is_taboo = true;
    }

    void Build(const std::vector<std::string>& set) {
        root = NewNode();
        for(const std::string &s : set) Insert(s);
        std::queue<RefPointer<TrieNode>> q;
        root->fail = root;
        for(int i=0;i<ALPHABET;i++) {
            if(root->ch[i]) {
                root->ch[i]->fail = root;
                q.push(root->ch[i]);
            } else root->ch[i] = root;
        }
        while(!q.empty()) {
            auto u = q.front(); q.pop();
            u->is_taboo |= u->fail->is_taboo;
            for(int i{0}; i < ALPHABET; i++) {
                if(u->ch[i]) {
                    u->ch[i]->fail = u->fail->ch[i];
                    q.push(u->ch[i]);
                } else u->ch[i] = u->fail->ch[i];
            }
        }
    }
public:
    auto Root() const -> RefPointer<TrieNode> {
        return root;
    }
    auto Next(RefPointer<TrieNode> u, char c) const -> RefPointer<TrieNode> {
        return u->ch[c-'a'];
    }
    auto IsTaboo(RefPointer<TrieNode> u) const -> bool {
        return u->is_taboo;
    }
    auto Size() const -> int {
        return node_pool.size();
    }
};
```

~~Remember that u are solving LuoguP4569 that time, `Taboo` means unallowed string.~~