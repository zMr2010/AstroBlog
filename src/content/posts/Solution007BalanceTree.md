---
title: Solution Report of Balance Tree(Medium) Topic
published: 2026-06-10 19:57:25
description: Give them a real war!
tags: [Splay, FHQ-Treap, Balance Tree]
category: Solution
draft: false
slug: '202606071324'
---

# P1552 [APIO2012] 派遣

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P1552)  
> ~~Reference Blog~~

The problem gives we a directed and rooted tree. So we can use DSU on tree to solve this problem.

For each leaf, initialize a DS with this node. When combine information of son to take more ninja in limit, pop the most expensive ninja and leader is now node, so answer is `set.size() * leader[u]`.

# P2173 [ZJOI2012] 网络

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P2173)  
> [Reference Blog](https://www.luogu.com.cn/article/vknsmpgp)

We noticed that the color in this problem less than 10 type. So we can maintain information of each chain which different color. Actually, it's a common trick to maintain chain.

When connect node $u$ and $v$, we should check they must on different chain, and because of nature of chain, $u,v$ must be the endpoints of their chain. This part we can write a function `link` to quick check it's valid to connect these node or not.

For operator `1`, we can regard it as cut and link, so the `link` function in last part can be used here. Cut operator is easy, FHQ-Treap can do split operator easily.

# P2497 [SDOI2012] 基站建设

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P2497)  
> [Reference Blog](https://www.luogu.com.cn/article/hnmu6zk2)

Let $f_i$ denotes the minimum cost make node $i$ connect to starter.

We can get a transition function that $f_i = \min_{j<i}(f_j+w(i,j))$, and function $w(i,j)$ denotes the minimum cost to connect node $i$ and node $j$. We can use Pythagorean theorem to expand it.

$$
\begin{aligned}
\because\ \text{Pythagorean\ theorem,} & \ (r'_i - r_j)^2 + (x_i - x_j)^2 = (r'_i + r_j)^2 \\
\therefore\ r'_i = & \frac{(x_i-x_j)^2}{4r_j} \\
\\
w(i,j) 
&= \sqrt{r'_i} + v_i \\
&= \sqrt{\frac{(x_i-x_j)^2}{4r_j}} + v_i\\
&= \frac{x_i-x_j}{2\sqrt{r_j}}
\end{aligned}
$$

![](https://cdn.luogu.com.cn/upload/image_hosting/ckbbfiuz.png)

Then we can change transition function to:
$$
\begin{aligned}
f_i &= f_j + \frac{x_i}{2\sqrt{r_j}} - \frac{x_j}{2\sqrt{r_j}} + v_i\\
f_i-v_i &= \left(\frac{1}{2\sqrt{r_j}}\right)x_i + \left(f_j - \frac{x_j}{2\sqrt{r_j}}\right)
\end{aligned}
$$

Li-Chao Segment tree can solve this problem easily, just query minimum at $x_i$, transition, and push line $i$.

# P3081 [USACO13MAR] Hill Walk G

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3081)  
> [Reference Blog](https://www.luogu.com.cn/article/mu50wbzx)

Most of solution in luogu is using Lichao Segment Tree. But I want to solve these problem by Balance Tree. So here is a different solution.

Also we need scanning-line to find all segment which satisfy $x_1 \le x < x_2$ ($x$ is the position bassie located), then we need to find a way to sort these segment let we can use single operator such eraser begin to maintain answer quickly.

Because problem promises the segment never cross, so the hierarchical relationship will never changed with position of bassie.

Then we can sort it by now position.

```cpp
struct Comparator {
    const std::vector<Segment>* seg;
    const ll* sweep_x;

    Comparator(
        const std::vector<Segment>* seg_ptr = nullptr,
        const ll* x_ptr = nullptr
    ) : seg(seg_ptr), sweep_x(x_ptr) {}

    bool operator()(int lhs, int rhs) const {
        if (lhs == rhs) {
            return false;
        }

        const Segment& a = (*seg)[lhs];
        const Segment& b = (*seg)[rhs];
        const ll x = *sweep_x;

        __int128 dx_a = a.x2 - a.x1;
        __int128 dy_a = a.y2 - a.y1;
        __int128 dx_b = b.x2 - b.x1;
        __int128 dy_b = b.y2 - b.y1;

        __int128 val_a =
            (__int128)a.y1 * dx_a + dy_a * (x - a.x1);

        __int128 val_b =
            (__int128)b.y1 * dx_b + dy_b * (x - b.x1);

        __int128 left = val_a * dx_b;
        __int128 right = val_b * dx_a;

        if (left != right) {
            return left < right;
        }

        return lhs < rhs;
    }
};
```

Left part just like monotonic queue, believe it's easy to realize.

# P3215 [HNOI2011] 括号修复 / [JSOI2011] 括号序列

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3215)  
> [Reference Blog](https://www.luogu.com.cn/article/tt15pohm)

For this classic problem, I am first time knowing that have a formula to calculate answer. We let `(` denotes $-1$, `)` denotes $1$, define $\text{premax}$ denotes maximum of prefix sum, define $\text{sufmin}$ denotes minimum of suffix sum. Then we can denotes answer by

$$
\bigg\lceil\frac{\text{premax}}{2}\bigg\rceil + \left\lceil\frac{|\text{sufmin}|}{2}\right\rceil
$$

The prove is easy. Don't misremember the formula, it's not sum of premax ad sufmin then divide by two, here is a counterexample: `)(`.

Then we can use FHQ-Treap or Segment Tree to solve this problem easily.

# P3224 [HNOI2012] 永无乡

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3224)  
> ~~Reference Blog~~

Also a classic problem, in this problem we know Balance Tree also can be used to simulate DSU.

Use Treap to simulate DSU, combine each block and query the k-th maximum is easy.

# P3268 [JLOI2016] 圆的异或并

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3268)  
> [Reference Blog](https://www.luogu.com.cn/article/d1wbcgxw)

We are given a strange condition just like [[USACO13MAR] Hill Walk G](#p3081-usaco13mar-hill-walk-g), because of the circle in this problem never cross, so the relative position never change. We can use set and scanning-line to calculate nesting levels of a circle.

Then because of we are calculating XOR area, even nesting levels lead to negative and odd lead to positive area.

# P3586 [POI 2015 R2] 物流 Logistics

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3586)  
> ~~Reference Blog~~

The core idea is to find the total contribution is 
$$
\sum \min(a_i, s)
$$

We will output `TAK` if total contribution greater than $c\times s$, or output `NIE`.

Then we can use BIT or Balance Tree solve it easily.

# P3968 [TJOI2014] 电源插排

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3968)  
> [Reference Blog](https://www.luogu.com.cn/article/tbjdg0vp)

First we can simulate the operation of this problem, to get all possible position. Because full scope can reach $10^9$, but the query just less than $10^5$, so this simulte can help we discretize.

So the first challenge is to simulate it. We can build two set. And one for coming, another one for leaving. More details, let the set used to manage coming to sort by length and right endpoint. So the begin is the range which next student will use.

And when a student leave, we need combine three ranges: `[l, x)`, `[x]`, `(x,r]`. We let set used to manage leaving sort by left point, then we can use binary search ( `find()`, the member function of `std::multiset`) can solve the question easily.

Whatmore, there is a small detail when manage leaving. We can allow empty range exist. For example, there is a range `[x, x]`, then a student use it, we also can make three ranges: `[x, x-1]`, `[x,x]`, `[x+1, x]`. Although the first and last range is invaild, but it can minus a lot of unnecessary special check.

After simulation, count is easy. This approach is off-line, and count we can use BIT or Segment Tree to solve it easily.