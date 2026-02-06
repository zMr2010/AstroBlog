---
title: Virtual Tree
published: 2026-02-06 11:54:11
description: A way to optmize some algorithm which time complexity is depend on tree size.
tags: [Tree, Graph]
category: Algorithm
draft: false
slug: '202602041847'
---

# Introduction

As we know that there are some problem we need maintain some information on a sparse tree (When we describe a tree is "sparse", there are few key points).

Using this structure, some tree DP algorithms that depend on tree size can be proven correct.

# Build Virtual Tree

We have two ways to build a tree.
1. sort twice.
2. monotonicity stack.

## Sort Twice

This algrithm is easy to code but hard to understand, below is algorithm flow:
1. sort key node by dfn.
2. get LCA for each close node.
3. build virtual tree.

How to prove this algorithm?

- If $x$ is an ancestor of $y$, then connect $x$ directly to $y$. Since the DFS order guarantees that the DFS orders of $x$ and $y$ are adjacent, there are no critical points on the path from $x$ to $y$.

- If $x$ is not an ancestor of $y$, then consider $\operatorname{LCA}(x,y)$ as an ancestor of $y$. Based on the previous case, it can be proven that there are no critical points on the path from $\operatorname{LCA}(x,y)$ to $y$.

Therefore, connecting $\operatorname{LCA}(x,y)$ and $y$ will not result in any omissions or repetitions.

Furthermore, will the fact that the first node is not connected to any node have any impact? Since the first node is always the root of the tree, it will not have any impact, so the total number of edges is $m-1$.

## Monotonicity Stack

This algorithm is maintaining a right chain of virtual tree.

Algorithm Flow:
1. push node $1$ (root) in stack.
2. sort the key node by dfs order.
3. check the LCA of stack top and now node.
4. pop stack top until dfs order of top is not greater than dfs order of LCA(top, now). we need add edge from new top to old top.
5. if `dfn[top] == dfn[LCA(top, now)]`, LCA is already in stack add edge directly; if less than, add edge from LCA to old top, and push LCA in stack.
6. then repeat above process.

```cpp
bool cmp(const int x, const int y) { return id[x] < id[y]; }

void build() {
    sort(h + 1, h + k + 1, cmp);
    sta[top = 1] = 1, g.sz = 0, g.head[1] = -1;
    // Push node 1 onto the stack, clear the adjacency list corresponding to node 1, and set the number of edges in the adjacency list to 0
    for (int i = 1, l; i <= k; ++i) {
        if (h[i] != 1) {
            // If node 1 is a key node, do not add it again
            l = lca(h[i], sta[top]);
            // Calculate the LCA between the current node and the top node of the stack
            if (l != sta[top]) {
                // If the LCA is different from the top element of the stack, it means that the current node is not on the chain stored in the current stack
                while (id[l] < id[sta[top - 1]]) {
                    // When the DFS order of the second largest node is greater than the DFS order of the LCA
                    g.push(sta[top - 1], sta[top]), top--;
                    // Connect the chains that do not overlap with the chain containing the current node and pop them
                }
                if (id[l] > id[sta[top - 1]]) {
                    // If the LCA is not equal to the second largest node (greater than or not equal to is essentially the same)
                    g.head[l] = -1, g.push(l, sta[top]), sta[top] = l;
                    // This indicates that the LCA is being pushed onto the stack for the first time. Clear its adjacency list, connect the edges, pop the top element from the stack, and push the LCA
                    // onto the stack
                } else {
                    g.push(l, sta[top--]);
                    // This indicates that the LCA is the second largest node. Pop the top element from the stack directly
                }
            }
            g.head[h[i]] = -1, sta[++top] = h[i];
            // The current node is necessarily the first one pushed onto the stack, clear the adjacency list and push it onto the stack
        }
    }
    for (int i = 1; i < top; ++i) {
        g.push(sta[i], sta[i + 1]); // Connect the last remaining chain
    }
    return ;
}
```

# Summarize

Tricky. Aslo can be considered violence.