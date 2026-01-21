---
title: Fast Mobius Transform and Fast Walsh-Hadamard Transform
published: 2026-01-16 20:00:07
description: A basic transform to calculate convolution
tags: [Math, Transform]
category: Algorithm
draft: true
slug: '20260116'
---

# Introduction

These two transforms have a lot of same point, so I want to introduce them together.

First of all, what's kind of problem these algorithm solve? It's used to solve formula like below format:

$$
c_k = \sum_{i\oplus j = k} a_i\times b_j
$$

* $\oplus$ can be any binary bitwise operations such as `or`, `and`, `xor`, etc.

And FMT(Fast Mobius Transform) is used to solve above formula when operation is `or` or `and`, FWT(Fast Walsh-Hadamard Transform) is used when operation is `xor`.

These two algorithms are too similar so that maybe you can see some blog or solution said they are same algorithm but please remember they not.

# FMT

Let's start with operation `or`.

The algorithm flow is:
1. Find a transform to transfer array $a, b$, let the array transfered named $A,B$;
2. Define $C$ such that $C_i = A_i\times B_i$;
3. Use the inverse transform to get $c$ from $C$.

## Or Operation

now the formula is:
$$
c_k = \sum_{i\lor j = k} a_i\times b_j
$$

We need construct a kind of transform by the algorithm flow. Let 
$$
A_i = \sum_{i=i\cup j} a_j
$$

And we can try derive it:

$$
\begin{aligned}
A_i\times B_i 
&= \left(\sum_{i\cup j=i}a_j\right)\left(\sum_{i\cup k=i}b_k\right)\\
&= \sum_{i\cup(j\cup k) = i}a_jb_k\\
&= C_i
\end{aligned}
$$

This form can use a inverse transform to get $c$ form $C$.

Now try find a quick way to calculate this transform. We know $i=i\cup j$ equal to find all the subset $j$ of $i$, and this need $O(3^n)$ time complexity, too slow.

Maybe we can focus on index:

| origin index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|:------------:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **binary form**  | 000 | 001 | 010 | 011 | 100 | 101 | 110 | 111 |

There is obviously a pattern: 0 and 4, 1 and 5, 2 and 6, etc. They have the same last two bits, and 0 is a subset of 4. This told us we can use this pattern make we calculate transform quickly.

```cpp
auto FMTor(const std::vector<ll>& a, int flag) -> std::vector<ll> {
    auto trA{a};
    for (int o{2}, k{1}; o <= n; o <<= 1, k <<= 1) {
        for (int i{0}; i < n; i += o) {
            for (int j{0}; j < k; j++) {
                trA[i+j+k] = (trA[i+j+k] + trA[i+j] * flag % MOD + MOD) % MOD;
            }
        }
    }
    return trA;
}
```

The time complexity of this code optmize above transform to O(n\times 2^n), because the length of array is $2^n$, maybe we can consider this algorithm is $O(n\log n)$ time complexity.

## And Operation

The algorithm flow is same. 
