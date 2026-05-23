---
title: Solution Report of Balance Tree(Easy) Topic
published: 2026-05-20 21:14:25
description: Balanced Tree problem list, but few Balanced Tree solutions.
tags: [Splay, FHQ-Treap, Balance Tree]
category: Solution
draft: true
slug: '202605202114'
---

# P1110 [ZJOI2007] 报表统计

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P1110)  
> ~~Reference Blog~~

Easy problem, we should maintain a 2D-vector with $n$ row, then answer the question from problem.

For `Min_Gap`, using a `std::set`(or Balance Tree) just will have 3 changes when we insert a number: delete old info from old tail and next head, then insert new info from old tail and new element, new info from new element and next head.

For `Min_Sort_Gap`, using another `std::set`(or Balance Tree), just query the previous and the next element then find min gap global.

# P1486 [NOI2004] 郁闷的出纳员

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P1486)  
> ~~Reference Blog~~

We noticed that the number of operator `A` and `S` just hundred, so voilence add and minus all node is okay; rest part is common Balance tree.

# P2869 [USACO07DEC] Gourmet Grazers G

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P2869)  
> [Reference Blog](https://www.luogu.com.cn/article/tpmedkhv)

This a problem using a classic idea: Sort by one variable, then use natrue by another variable to solve problem.

Same here, we sort all element (include grass) by taste, then push then into a multiset let it sort by price, then we can find the minimum price.

# P3466 [POI 2008] KLO-Building blocks

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3466)  
> ~~Reference Blog~~

It is not hard to find we can traverse all $k$-length range and calculate the answer.

Then the best answer is change all element into median. Then we need a data structure which can find median, calculate the sum of all element less (or greater) than a value. This function can use Balance Tree to solve it easily.

# P7619 [COCI 2011/2012 #2] RASPORED

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P7619)  
> [Reference Blog](https://www.luogu.com.cn/article/kca1drz5)

If we fire this pancake with order sequence $p$, answer can be express by:
$$
\begin{aligned}
Answer 
&= \sum_{i=1}^n\left(L_{p_i}-\sum_{j=1}^iT_{p_j}\right) \\
&= \sum_{i=1}^nL_{p_i} - \sum_{i=1}^n(n-i+1)T_{p_i}
\end{aligned}
$$

Then sum of $L$ can calculate at the beginning, right part can sort $T$ in ascending order. Balance Tree can solve it easily.

# P11373 「CZOI-R2」天平

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P11373)  
> [Reference Blog](https://www.luogu.com.cn/article/s827aknc)

Here's another trick: When we need to check if there exists a sequence $c$ satisfying $\forall c_i\lt\Z$ such that $\sum a_ic_i = v$, and then simply check if $v$ is a multiple of $\gcd(c_i)$.  
This is because of Bézù Theorem.

Then it's easy to find that $\gcd(a_i) = \gcd[\gcd(a_1, a_2), \gcd(a_2, a_3), \dots]$ (It's same with prove $\gcd(a,b,c) = \gcd(\gcd(a,b), \gcd(b,c))$, easy to prove by emotional understanding).

Use Subtractive Euclidean Algorithm, that is $\gcd(a, b) = \gcd(a, a-b)$, can be deduced:
$$
\begin{aligned}
\gcd(a_1, a_2, \dots, a_n) &= \gcd[\gcd(a_1, a_2), \gcd(a_2, a_3), \dots, \gcd(a_{n-1}, a_n)]\\
&= \gcd[\gcd(a_1, a_2-a_1), \gcd(a_2, a_3-a_2), \dots, \gcd(a_{n-1}, a_n-a_{n-1})]\\
&= \gcd(a_1, \gcd(b_2, b_3, \dots, b_n))
\end{aligned}
$$

$b_i = a_i - a_{i-1}$ in above equation.

Then we can use Balance Tree to solve this problem.

Code is difficult.

# P12179 DerrickLo's Game

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P12179)  
> [Reference Blog](https://www.luogu.com.cn/article/8ng6msb3)

Also a tricky problem, the core idea is: because there is no minus operator, the final sequence will be all maximum of origin sequence. So do second operator with all 2-length subsequence is best. Specially, for element $x-1, x-2, x-3$ will use first operator.

Then we can use Segment Tree to solve this problem.

# P14379 【MX-S9-T2】「LAOI-16」摩天大楼

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P14379)  
> [Reference Blog](https://www.luogu.com.cn/article/k3lletff)

The problem with mex is usually need to think position of number `1`.

If a range satisfy $f(l, r)=0$:
1. there is no `1` in whole range;
2. the start point and end point of range is `1`, and range $(l,r)$ have no $2$.

Emm, nerd writer first think range $\{1,2,3,3,2,1\}$ also can let $f = 0$, but wrong. That's becase the problem need us find a cut point in range, instead find $\operatorname{mex}$ for whole range.

Left part is easy, use Segment Tree can do counting easy.