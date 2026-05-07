---
title: Introduction of Splay
published: 2026-05-01 12:04:23
description: Rotate last accessed node to root to maintain amortized efficiency.
tags: [Structure, Balance Tree, Splay]
category: Algorithm
draft: true
slug: '202605011204'
---

# What is Splay Tree?

> **Useful Link:**  
>
> [Another blog about Balance tree](https://old.517group.cn/posts/34701/)

The most common two balance trees is Splay and Treap. I already have introduced treap before so this article let's learn Splay.

Unlike Treap, the basic operation of Splay is rotate. By rotating, we can let the node we want move to root. The core idea of Splay is using Splay function to let the node we recently visited depth get shallower.

# What is its function?

It's a Balanced BST (Binary Search Tree), which can search, insert, delete a node in $O(\log n)$. And it can promise the tree balance.

Before explain the core operation *Splay*, You need know some basic sturcture and checking function.

## Basic Structure

The example code in this article will using array to simulate pointer, the version more save will publish later.

| Variable Name | Meaning |
|:----------:|:-------:|
| `rt` | Id of root |
| `id` | the quantity of used node |
| `fa[i]` | father of node $i$ |
| `ch[i][0/1]` | left/right children of node $i$ |
| `val[i]` | Value of node $i$ |
| `cnt[v]` | The times value $v$ appear |
| `sz[i]` | The size of sub tree which root is $i$ |

Set all value to $0$ when initial.

## Checking Function

```cpp
bool dir(int x) {
    return x == ch[fa[x]][1]; // if x is left son return 0, or return 1.
}
void pushUp(int x) {
    sz[x] = cnt[x] + sz[ch[x][0]] + sz[ch[x][1]]; 
    // Update all information after changing position of node.
}
```

# How to Rotate?

First we should know how the basic operation, rotate work.

![](/article_needed/202605011204/RotateSample.png)

This image told us how to rotate node $x$ in a tree. It's not difficlut to find that the inorder traversal of this tree have no changes. So rotate can not change the BST property of Splay tree. And it also a way to maintain the time complexity (or length) of Splay tree.

```cpp
void rotate(int x) {
    int y = fa[x], z = fa[y];
    bool r = dir(x);
    ch[y][r] = ch[x][!r];
    ch[x][!r] = y;
    if (z) ch[z][dir(y)] = x;
    if (ch[y][r]) fa[ch[y][r]] = y;
    fa[y] = x;
    fa[x] = z;
    push_up(y);
    push_up(x);
}
```
Observe the picture I drawed can understand this function.

# How to Splay?

Then, many rotate operation become a splay operation. There are some basic model when doing splay : Zig, Zig-Zig, Zig-Zag.

We define function `Splay(x, k)` denotes let node $x$ move up until be son of node $k$.

Without thinking, do nothing if $x = k$.

## Zig

This situation when $x$ is son of $k$. Just rotate $x$ is okay. 

In splay tree, we only do left rotate operation when $x$ is right son, and only do right rotate operation when $x$ is left son. That can lead us using one function to realize `Splay(x,k)` in code.

## Zig-Zig

This situation when $x$ and $fa_x$ is son in same side of their father. We should first rotate $fa_x$ then rotate $x$, we can do a little contrast.

![](/article_needed/202605011204/ContrastSample.png)

Why not rotate $x$ twice? That because it will change the relative position of $fa_x$ and $x$. Using correct Zig-Zig plan can let the final struction also Zig-Zig, and this plan also get best time complexity when potential method

## Zig-Zag

This situation when $x$ and $fa_x$ is son in different side of their father. We can rotate $x$ twice in this situation.

![](/article_needed/202605011204/ZigZagSample.png)

We can found the height of this tree decrease.

## Code

Then we know all the operator in each situation we can write the code:

```cpp
void splay(int& z, int x) {
    int w = fa[z];
    for (int y; (y = fa[x]) != w; rotate(x)) { // whatever which situation, the last operation is rotate x
        if (fa[y] != w)  // if zigzig or zigzag
            rotate(dir(x) == dir(y) ? y : x); // check it's zigzig or zigzag
    }
    z = x;
}
```

# How Splay Tree Do Basic Operation of Balance Tree?

And below is how splay to realize some classic operation.

## Find with Value

Because Splay Tree also a BST, so the process find a node with value is same as BST, a only difference is we need splay node we found to root.

```cpp
// find value v; if not found, end at last accessed node
void find(int& z, int v) {
    int x = z, y = 0; // x: current node, y: last visited node
    for (; x && val[x] != v; x = ch[y = x][v > val[x]]);
    // traverse BST; stop when found or reach null
    splay(z, x ? x : y);
    // splay the found node, or the last accessed node to root
}
```

## Find with Rank

Same as treap too.

```cpp
void loc(int& z, int k) {
    int x = z;
    for (;;) {
        if (sz[ch[x][0]] >= k) {
            x = ch[x][0];
        } else if (sz[ch[x][0]] + cnt[x] >= k) {
            break; 
        } else {
            k -= sz[ch[x][0]] + cnt[x];
            x = ch[x][1];
        }
    }
    splay(z, x);
}
```

## Insert a Value

```cpp
void insert(int v) { // insert value v
    int x = rt, y = 0;
    for (; x && val[x] != v; x = ch[y = x][v > val[x]]);
    // find a node with value 
    if (x) { // if already have this node (isn't empty node & value is wanted)
        ++cnt[x];
        ++sz[x];
    } else { // is a empty node
        x = ++id; // new node & initialize
        val[x] = v;
        cnt[x] = sz[x] = 1;
        fa[x] = y;
        if (y) ch[y][v > val[y]] = x; // insert it
    }
    splay(rt, x); // splay it to root
}
```

## Merge Two Slay Trees

This operation really like treap.

```cpp
int merge(int x, int y) {
    if (!x || !y) return x | y;
    loc(y, 1); // find the minimum of tree y, it must have no left children
    ch[y][0] = x;
    fa[x] = y;
    push_up(y);
    return y; // return now root
}
```

## Remove a Value

```cpp
bool remove(int v) {
    find(rt, v);
    if (!rt || val[rt] != v) return false;
    --cnt[rt];
    --sz[rt];
    if (!cnt[rt]) {
        int x = ch[rt][0];
        int y = ch[rt][1];
        fa[x] = fa[y] = 0;
        rt = merge(x, y);
    }
    return true;
}
```

## Query Rank

```cpp
int find_rank(int v) {
    find(rt, v); // we cannot sure result find returned must greater or less than v when v is not exist
    return sz[ch[rt][0]] + (val[rt] < v ? cnt[rt] : 0) + 1;
}
```

## Query Prevent and Next

```cpp
int find_prev(int v) {
    find(rt, v); // rt exist and val[rt] less than v
    if (rt && val[rt] < v) return val[rt];
    int x = ch[rt][0]; // this situation when v exist or have a node which greater than v
    if (!x) return -1; // so check now node's left subtree
    for (; ch[x][1]; x = ch[x][1]); // the maximum of left subtree is rightest node
    splay(rt, x);
    return val[rt];
}

// same with find_prev
int find_next(int v) {
    find(rt, v);
    if (rt && val[rt] > v) return val[rt];
    int x = ch[rt][1];
    if (!x) return -1;
    for (; ch[x][0]; x = ch[x][0]);
    splay(rt, x);
    return val[rt];
}
```

## All Code

From [OI wiki](https://oi-wiki.org/ds/splay/#%E5%8F%82%E8%80%83%E5%AE%9E%E7%8E%B0).

```cpp
#include <iostream>

constexpr int N = 2e6;
int id, rt;
int fa[N], val[N], cnt[N], sz[N], ch[N][2];

bool dir(int x) { return x == ch[fa[x]][1]; }

void push_up(int x) { sz[x] = cnt[x] + sz[ch[x][0]] + sz[ch[x][1]]; }

void rotate(int x) {
  int y = fa[x], z = fa[y];
  bool r = dir(x);
  ch[y][r] = ch[x][!r];
  ch[x][!r] = y;
  if (z) ch[z][dir(y)] = x;
  if (ch[y][r]) fa[ch[y][r]] = y;
  fa[y] = x;
  fa[x] = z;
  push_up(y);
  push_up(x);
}

void splay(int& z, int x) {
  int w = fa[z];
  for (int y; (y = fa[x]) != w; rotate(x)) {
    if (fa[y] != w) rotate(dir(x) == dir(y) ? y : x);
  }
  z = x;
}

void find(int& z, int v) {
  int x = z, y = fa[x];
  for (; x && val[x] != v; x = ch[y = x][v > val[x]]);
  splay(z, x ? x : y);
}

void loc(int& z, int k) {
  int x = z;
  for (;;) {
    if (sz[ch[x][0]] >= k) {
      x = ch[x][0];
    } else if (sz[ch[x][0]] + cnt[x] >= k) {
      break;
    } else {
      k -= sz[ch[x][0]] + cnt[x];
      x = ch[x][1];
    }
  }
  splay(z, x);
}

int merge(int x, int y) {
  if (!x || !y) return x | y;
  loc(y, 1);
  ch[y][0] = x;
  fa[x] = y;
  push_up(y);
  return y;
}

void insert(int v) {
  int x = rt, y = 0;
  for (; x && val[x] != v; x = ch[y = x][v > val[x]]);
  if (x) {
    ++cnt[x];
    ++sz[x];
  } else {
    x = ++id;
    val[x] = v;
    cnt[x] = sz[x] = 1;
    fa[x] = y;
    if (y) ch[y][v > val[y]] = x;
  }
  splay(rt, x);
}

bool remove(int v) {
  find(rt, v);
  if (!rt || val[rt] != v) return false;
  --cnt[rt];
  --sz[rt];
  if (!cnt[rt]) {
    int x = ch[rt][0];
    int y = ch[rt][1];
    fa[x] = fa[y] = 0;
    rt = merge(x, y);
  }
  return true;
}

int find_rank(int v) {
  find(rt, v);
  return sz[ch[rt][0]] + (val[rt] < v ? cnt[rt] : 0) + 1;
}

int find_kth(int k) {
  if (k > sz[rt]) return -1;
  loc(rt, k);
  return val[rt];
}

int find_prev(int v) {
  find(rt, v);
  if (rt && val[rt] < v) return val[rt];
  int x = ch[rt][0];
  if (!x) return -1;
  for (; ch[x][1]; x = ch[x][1]);
  splay(rt, x);
  return val[rt];
}

int find_next(int v) {
  find(rt, v);
  if (rt && val[rt] > v) return val[rt];
  int x = ch[rt][1];
  if (!x) return -1;
  for (; ch[x][0]; x = ch[x][0]);
  splay(rt, x);
  return val[rt];
}

int main() {
  int n;
  std::cin >> n;
  for (; n; --n) {
    int op, x;
    std::cin >> op >> x;
    switch (op) {
      case 1:
        insert(x);
        break;
      case 2:
        remove(x);
        break;
      case 3:
        std::cout << find_rank(x) << '\n';
        break;
      case 4:
        std::cout << find_kth(x) << '\n';
        break;
      case 5:
        std::cout << find_prev(x) << '\n';
        break;
      case 6:
        std::cout << find_next(x) << '\n';
        break;
    }
  }
  return 0;
}
```