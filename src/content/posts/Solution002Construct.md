---
title: Solution Report of Construct Topic
published: 2026-01-22 15:54:20
description: Trick problem
tags: [Construct]
category: Solution
draft: false
slug: '20260122'
---

# Introduction

It's the problem list of 01/22/2026 class, about construct problem, that's a tricky part in OI, know we will see some.

# A - QOJ-4913 子集匹配

[Problem Statement](https://vjudge.net/problem/QOJ-4913/origin)

Transfer problem statement:
> $L$: All subset which exactly have $K$ ones.  
> $R$: All subset which exactly have $K-1$ ones.  
> One edge from $S$ to $T$ equal to change a 1-node in $S$ to 0 then $S$ equal to $T$.  
> This problem require different $S$ cannot contact same $T$.

Construct Idea:
> let 1 equal to add 1 and 0 equal to minus 1.  
> then find the max position $p$ of prefix sum.  
> flip 0&1 in position $p+1$.

Prove: Why it is a injection?
> assumpted there is a $S'$ mapped same $T$ with $S$.  
> we can find that $T$ have $i,j$ places which $S$ or $S'$ is $1$ but now is $0$, so $T$ must have $K-2$ ones, it's not satisfy difinition of $T$, so this mapping must be a injection.

Good problem, it's take me 1 day to understand.

# B - Adjacent Difference

[Problem Statement](https://atcoder.jp/contests/agc066/tasks/agc066_a?lang=en)

For this kind of construction problem, we can try to solve it using some special subtask.

If this matrix just have 0/1, and $d$ equal to $1$, how to modify it? It's not difficult to find that answer must be below form:

```
010  |  101
101  |  010
010  |  101
```

We can calculate answer in each situation, get the mininum. Then try to expand this special solution to whole problem. We can enumerate a $k$ then difine odd and even be below rules:

$$
\begin{aligned}
\operatorname{odd}\ &: \ a \equiv k & \pmod{2d}\\
\operatorname{even}\ &: \ a \equiv k+d & \pmod{2d}
\end{aligned}
$$

Using above solution, time complexity is $O(dn^2)$.

# C - Make SYSU Great Again II

[Problem Statement](https://qoj.ac/problem/7629)

We call the cell which:
- $(i+j)\bmod 2 = 0$ is **Black Cell**.
- $(i+j)\bmod 2 = 1$ is **White Cell**.

So we need promise the bitwise and value of each close Black and White cell equal to 0. Then we can start our constructing.

First we have below guess:
1. Assign unique number in Black Cell.
2. Then put avaliable number in White Cell.

We need find a way to calculate the number in cell quickly.

For black cell:
```
high bits = gray( (i + j) / 2 )
low  bits = gray( (i - j + (n-1)) / 2 )

value = (high << K) | low
```
You can proove that different cell $(i,j)$ map different gray code number.

Maybe four neighbors can generate at most 4 same number, and add one of black cell, at most 5 same number, statisfy the problem requirement.

# D - Tournament Construction

[Problem Statement](https://codeforces.com/problemset/problem/850/D)

According to the Landau theorem, we sort the original sequence $a$ and define $f(i,j,y)$ as representing a graph of size $i$ with vertices $j$ and edges $y$.

According to the theorem, $y ≥ \frac{j(j−1)}{2}$ always holds true.

We enumerate $i,j,y$ and the state at $i−1$. If $f(i−1,k,x)$ is feasible, then $f(i,j,y)$ is also feasible.

We also record $j−k$ at this point.

This allows us to construct the original out-degree sequence.

Let the out-degree sequence established in step 1 be $d_i$, and the one established in step 2 be $u_i$. First, assume $\forall i>j$, and all edges are in the direction $i\rightarrow j$. Then $u_i = i−1$.

Each time, find a triple $(i,j,k)$ such that $u_i > d_i, u_j = d_j, u_k < d_k$, and there exist edges $i\rightarrow j$ and $j\rightarrow k$.

In this way, we can reverse these two edges, achieving the effect that $u_i \leftarrow u_i −1, u_j \leftarrow u_j, u_k \leftarrow u_k −1$.

By continuously repeating the above steps, u can gradually approach d, eventually becoming exactly the same.

# E - LGP10441 [JOIST 2024] 乒乓球 / Table Tennis

[Problem Statememt](https://www.luogu.com.cn/problem/P10441)

We have a classic conclusion: the struction of tournament just depend on in-degree array, and triple circle will add one more when we change a pair $(x,x+2)$ to $(x+1,x+1)$.

So we can use this to construct it.

Find the smallest $n_0$ which can statisfy the maximum triple circle less than $m$, then change the triple circle quantity on it.