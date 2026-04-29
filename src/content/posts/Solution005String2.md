---
title: Solution Report of String(Middle) Topic
published: 2026-04-29 21:06:35
description: Hard.
tags: [String]
category: Solution
draft: false
slug: '202604042043'
---

# P12923 [POI 2021/2022 R3] 模板 2 / Szablon 2

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P12923)  
> [Reference Blog](https://www.luogu.com.cn/article/vakgr3sm)

You can found that if a chain of expanding just contribute length less than half, they all can be replaced by the last one.

![](https://cdn.luogu.com.cn/upload/image_hosting/0n83p1oj.png)

Then we can using ExKMP to calculate the LCP of origin string and adverse string, knowing that which place should not place string.

The last part we can greedy, the strategy is find the most back position which can compare a origin string or adverse string, it is easy. But there I know a new way to maintain this position which is using DSU instead SegTree.

At first each node point to themselves. Then if note $x$ become invalid, let `fa[x] = find(x-1)`. So the root of each DSU is the most back position which valid.

# P11291 【MX-S6-T3】「KDOI-11」简单的字符串问题 2

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P11291)  
> [Reference Blog](https://www.luogu.com.cn/article/ftdd4xx2)

# P10716 【MX-X1-T4】「KDOI-05」简单的字符串问题

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P10716)  
> [Reference Blog](https://www.luogu.com.cn/article/yqrbdxme)

We can prove that a string `A` is valid if and only if:

* `A` is a border of `S[1..i]`;
* `A` appears at least `k` times in `S[1..i]` without overlap.

After building the failure tree, we can observe that all valid `A` form a chain from some node `u` to the root, and `u` is an ancestor of `i`. Therefore, once we know `u`, the answer is simply `dep[u]`.

We can find `u` using binary lifting.  
This is equivalent to checking the following condition:

> Whether the position of the `k`-th non-overlapping occurrence of `S[1..u]` is ≤ `i`.

So we preprocess, for every prefix `S[1..u]`, the positions where this string appears in the whole string without overlap. This is equivalent to repeatedly finding the first suffix after the current position whose LCP with `S` is at least `u`, and then jumping to that suffix.

The total number of jumps is at most:

$$
\sum_{i=1}^{n} \frac{n}{i} = O(n \log n)
$$

so we can just simulate the jumps directly.

To compute the LCP between a suffix and `S`, we can use the Z-function.  
Then we apply the DSU trick to maintain a linked list: enumerate `u` from small to large, and after finishing `u`, delete all positions `p` with `z[p] = u`. This guarantees that when processing `u`, the DSU representative of a position is exactly the next position with `z[p] \ge u`.

In this way, we can find in `O(\alpha(n))` the first position `p` after a given index such that `z[p] ≥ u`.

Note that the case `k = 1` needs to be handled separately.

Thus the total time complexity is:

$$
O(q \log n + n \alpha(n) \log n)
$$


# P9482 [NOI2023] 字符串

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P9482)  
> [Reference Blog](https://www.luogu.com.cn/article/67y2662p)


# P6125 [JSOI2009] 有趣的游戏

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P6125)  
> [Reference Blog](https://www.luogu.com.cn/article/b9o7hxjc)

It's not hard to think of using ACAM to solve this problem. But the difficlut point is if the state denote probability when through a node on ACAM, but ACAM have cycle so we cannot use it. 

Consider below things: We stop when across a *mark point* on ACAM, so we can let state to calculate expectation. Because we stop when meet first mark point, so we can promise the sum of expectation of each node equal to $1$. Expectation now is equal to probability.

Left part is easy, just use gaussian elimination solve it.

# P5466 [PKUSC2018] 神仙的游戏

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P5466)  
> [Reference Blog](https://www.luogu.com.cn/article/i80intxg)

We found that if a string $s$ have a border length $len$, it will have a cyclic section with length $n-len$. So wildcard become meanless because we can calculate them by cyclic section.

To be more, if $i$ and $j$ are equal modulo $n-len$, $s_i$ and $s_j$ are must equal, or $len$ is impossible.

So we can define two array:
1. $a[i]$, it will equal $1$ only when $s[i]$ is equal $1$.
2. $b[i]$, it will equal $1$ only when $s[i]$ is equal $0$.

Then we can use

$$
C[d] = \sum_{i=1}^n A[i]\times B[i+d]
$$

to count there are different number pair in length $d$.

left part is easy, just check a length $len$ is valid or not then add it contribution to answer.

# P4569 [BJWC2011] 禁忌

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P4569)  
> [Reference Blog](https://www.luogu.com.cn/article/ud0jpeti)

The optimal strategy is greedy.

Suppose we have already matched a taboo string ending at position `i`.

- If we cut immediately, we gain `+1`, and restart.
- If we delay, this segment may overlap with future matches, possibly reducing total count.

Thus: Cut immediately whenever a taboo string appears is optimal.

We build an **AC Automaton** over all taboo strings.

Each state represents:

- current suffix match
- whether we have matched a taboo string (`is_taboo`)

And do `is_taboo[u] |= is_taboo[fail[u]]`. So any suffix match is correctly detected.

Let:

- `state` denotes current node in AC automaton
- plus one extra dimension: **accumulated expectation**

So total dimension is `states + 1`

Since the string is random, each character is chosen with probability `1 / alphabet`.

Enumerate `(u, c)`, let `v = next(u, c)`.

If `v` is not taboo, just transfer `u → v`.  
If `v` is taboo, we greedily cut here, so `u → root` and contribute `+1`.

To handle expectation, add one extra dimension `ans_col`.  
When hitting a taboo, do `trans[u][ans_col] += 1 / alphabet` and let `trans[ans_col][ans_col] = 1` so the answer accumulates.

Now the whole process becomes a linear transfer:

$$
f_{t+1} = f_t × trans
$$

We need exactly length `len`, so compute `trans^len`

Starting from root, the answer is `(trans^len)[root][ans_col]`.  
Time complexity is $O(S^3 log len)$ where $S$ is number of AC states.

# P4081 [USACO17DEC] Standing Out from the Herd P

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P4081)  
> [Reference Blog](https://www.luogu.com.cn/article/i7em3ard)

There is common trick when SA is solving a problem with lot of string. Let these string end to end, and using a character which not in character set to connect them.

Let the initial answer equal to $\frac{len\times(len+1)}{2}$. 

For each suffix $x$, the excluded answer is $\max(\operatorname{lcp}(x,i),\operatorname{lcp}(x,j),\operatorname{lcp}(x,k))$, where $i$ is the suffix with the largest rank satisfying $rk[i]<rk[x], id[i]\neq id[x]$, $j$ is the suffix with the smallest rank satisfying $rk[j]>rk[x], id[j]\neq id[x]$, and $k$ is the suffix with the largest rank satisfying $id[k]=id[x]$.

Then we can find `hight` array in SA is equal to excluded part. So just minus them.

# P4465 [国家集训队] JZPSTR

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P4465)  
> [Reference Blog](https://www.luogu.com.cn/article/ew1fgtds)

It said that std of this problem is Unrolled Linked List + SAM, but most solution in Luogu using bitset to solve it and get a great score.

Because the character set is little just 10, we let `std::bitset<N> b[x]` denote character $x$ is at $pos$ if `b[x][pos] = 1`. Then we can maintain each oeprate easily.

0. right move origin string length of $y_i$ from $x_i$, then put $y_i$ in the blank.
1. same with above, left move origin string length of $y_i - x_i + 1$.

Then how to match a string become the main problem. Repeat `ans = (ans << 1) & b[z[j]-'0']` then the number of $1$ is answer, draw the process then you can understand, this algorithm called Shift-and.

# P4045 [JSOI2009] 密码

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P4045)  
> ~~Reference Blog~~

Classic problem, do compression DP on ACAM.

Let `dp[i][j][msk]` denotes when we contract to place $i$ and we are on the node $j$ ACAM and the usage state of preparing string is $msk$. Then transition is easy.

$$
dp[i][j][msk] \rightarrow dp[i+1][tr_{j,l}][msk|state_{tr_{j,l}}]
$$

$tr_{j,l}$ denotes the son of node $j$ which is meaning letter $l$.

The answer is sum of $dp[n][j][fullmask]$.

# P3823 [NOI2017] 蚯蚓排队

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3823)  
> [Reference Blog](https://www.luogu.com.cn/article/i57xokd8)

Becasue $k$ is very little, we can maintain answer of each $k$ when hashtable is merging and splitting.

We can maintain this queue by list, and answer only related to $k$. For example, if we are merging two queue, just enumerate the length $l$ and enumerate start point $j$ then count all string that two endpoints are on both sides of the splice.

The time complexity is $O(nk + ck^2 + \sum |s|)$, $c$ is the number of second operation. Because each operate will just produce $k^2$ hash value at most.

# P1117 [NOI2016] 优秀的拆分

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P1117)  
> [Reference Blog](https://www.luogu.com.cn/article/cojjoptx)

# P3234 [HNOI2014] 抄卡组

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3234)  
> [Reference Blog](https://www.luogu.com.cn/article/pmisez51)

Analyze in 3 cases.

1. All string have no `*`, compare them with hash.
2. All string have `*`, check substring from 0 to first `*` is prefix of next string, and the substring from last `*` to end is suffix of next string. Remember sort with length.
3. Both two case. First, check same as case 1. Then we can use hash check beginning, middle, ending part of this string.

# P3715 [BJOI2017] 魔法咒语

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3715)  
> [Reference Blog](https://www.luogu.com.cn/article/7n1nyh5r)

Also a classic problem, similar as P4045 but this problem should split into two part to solve it.

First for small $L$, do compress DP on ACAM, the state $dp[len][j]$ denotes we already get new magic which length is $len$ and we are at node $j$ on ACAM. Transition is easy. Enumerate all string if there are no bad word, we can transition.

Then try think how to solve this problem when $L <= 10^8$, first we can know that we must use matrix multiple to solve it when $L$ become such so big. So we have below idea:

$$
\left[\begin{matrix}
F_t \\ F_{t+1}
\end{matrix}\right]
=
\operatorname{Matrix}
\times
\left[\begin{matrix}
F_{t-1} \\ F_{t}
\end{matrix}\right]
$$

Then their is a common trick when construct matrix: if $i$ can transition to $j$, `mat[i][j]++`.  
Same as first case, transition is easy, then we can get transition matrix.

# P3245 [HNOI2016] 大数

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3245)  
> [Reference Blog](https://www.luogu.com.cn/article/8rzcesm7)

We using $sum[i]$ denotes the value of $S[i\dots n]$.

Also we can analyze into $2$ cases: $P$ equal or not equal to $2$ and $5$.

If is not:

$$
\begin{aligned}
&\ \frac{sum[L] - sum[R+1]}{10^{n-R}} \bmod P = 0\\
\Rightarrow &\  (sum[L] - sum[R+1]) \bmod P = 0 \\
\Rightarrow &\  sum[L] \equiv sum[R+1] \pmod{P} \\
\end{aligned}
$$

Then problem turn to count how many same number in $sum[L\dots R+1]$, it a classic problem of Mo's algorithm.

If is:

It become easier: if the end of a number can be divided by $2$ or $5$ then whole number can be divided by it, so answer increase $i$ if $a[i] \bmod P = 0$.

# P3546 [POI 2012] PRE-Prefixuffix

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3546)  
> [Reference Blog](https://www.luogu.com.cn/article/bghgaezw)

Because of the length-$L$ prefix and suffix can be represented as `XY` and `YX`, if we using $k$ denote the cut position between $X$ and $Y$. Then we have : $s[1\cdots k]=s[n-k+1\cdots n],s[k+1\cdots L]=s[n-L+1\cdots n-k]$. This means that problem wants to us calculate two borders.

then is a interesting transition: turn origin string into form $s_1,s_n,s_2,s_{n-1},\cdots$, two borders problem let we calculate become two palindromes on top. So using manacher can solve this problem easily.

# P3454 [POI 2007] OSI-Axes of Symmetry

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3454)  
> [Reference Blog](https://www.luogu.com.cn/article/bghgaezw)


If a shape is symmetrical, we can get a palindrome if cut from a endpoint of axis of symmetry.

So use cross product instead of angle, the square of an edge's length instead of length of edge. Then manacher to count how many palindrome can cover a length $n$ substring in the double-string. double-string means we paste a copy of origin string at the end of origin string.

