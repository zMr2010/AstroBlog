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

We are trying to find a transform like FMT Or operation.

Let $A$ is the array after transform, we have:
$$
A_i = \sum_{i=i\cap j} a_j
$$

That means $j$ is the superset of $i$, so just like before but we should add contribution from superset to subset.

```cpp
auto FMTand(const std::vector<ll>& a, int flag) -> std::vector<ll> {
    auto trA{a};
    for (int o{2}, k{1}; o <= n; o <<= 1, k <<= 1) {
        for (int i{0}; i < n; i += o) {
            for (int j{0}; j < k; j++) {
                trA[i+j] = (trA[i+j] + trA[i+j+k] * flag % MOD + MOD) % MOD;
            }
        }
    }
    return trA;
}
```

## Full Template

Really not difficult

```cpp
/**
 * @file    : FastMobiusTransform.cpp 
 * @date    : 2026-01-15
 * @brief   : LuoguP4717
 */

#include <iostream>
#include <vector>

#include <iostream>
#include <vector>

class FastMobiusTransform {
private:
    using ll = long long;

    const int MOD;
    int n;
    std::vector<ll> a, b;
public:
    explicit FastMobiusTransform(int n, int MOD) : MOD{MOD}, n{n}, a(n), b(n) {}
    FastMobiusTransform(int MOD, const std::vector<ll> a, const std::vector<ll> b)
        : MOD{MOD}, n(a.size()), a{a}, b{b} {}

    void input() {
        for (int i{0}; i < n; i++) {
            std::cin >> a[i];
        }
        for (int i{0}; i < n; i++) {
            std::cin >> b[i];
        }
    }

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
    auto FMTand(const std::vector<ll>& a, int flag) -> std::vector<ll> {
        auto trA{a};
        for (int o{2}, k{1}; o <= n; o <<= 1, k <<= 1) {
            for (int i{0}; i < n; i += o) {
                for (int j{0}; j < k; j++) {
                    trA[i+j] = (trA[i+j] + trA[i+j+k] * flag % MOD + MOD) % MOD;
                }
            }
        }
        return trA;
    }

    auto transformOr() -> std::vector<ll> {
        auto trA = FMTor(a, 1);
        auto trB = FMTor(b, 1);
        std::vector<ll> trC(n);
        for (int i{0}; i < n; i++) {
            trC[i] = trA[i] * trB[i] % MOD;
        }
        return FMTor(trC, -1);
    }
    auto transformAnd() -> std::vector<ll> {
        auto trA = FMTand(a, 1);
        auto trB = FMTand(b, 1);
        std::vector<ll> trC(n);
        for (int i{0}; i < n; i++) {
            trC[i] = trA[i] * trB[i] % MOD;
        }
        return FMTand(trC, -1);
    }
};

auto main() -> int {
    int n, MOD;
    std::cin >> n >> MOD;
    FastMobiusTransform fmt(1<<n, MOD);
    fmt.input();

    auto ans_or{fmt.transformOr()};
    for (auto& p : ans_or) {
        std::cout << p << ' ';
    }
    std::cout << "\n";
    auto ans_and{fmt.transformAnd()};
    for (auto& p : ans_and) {
        std::cout << p << ' ';
    }
    std::cout << "\n";
    return 0;
}
```

# FWT

As you can see this part we are going to introduce FWT, this algorithm is using to solve below formula:
$$
c_k = \sum_{i\oplus j = k} a_i\times b_j
$$
* $\oplus$ indicates XOR operator.

Let $A$ is the transformed array of $a$ that:
$$
A_i = \sum_{i\circ j = 0} a_j - \sum_{i\circ j = 1} a_j
$$
* In the formula, $i\circ j$ indicates $\operatorname{popcount}(i\cap j)\bmod 2$

And we can check its correctness:

$$
\begin{aligned}
A_i\times B_i
&= \left(\sum_{i\circ j = 0} a_j - \sum_{i\circ j = 1} a_j\right)\times \left(\sum_{i\circ k = 0} b_k - \sum_{i\circ k = 1} b_k\right)\\
&= \left(\sum_{i\circ j = 0} a_j\sum_{i\circ k = 0} b_k + \sum_{i\circ j = 1}a_j\sum_{i\circ k = 1} b_k\right) - \left(\sum_{i\circ j = 0} a_j\sum_{i\circ k = 1} b_k + \sum_{i\circ j = 1}a_j\sum_{i\circ k = 0} b_k\right)\\
&= \sum_{(j\oplus k)\circ i = 0} a_ib_k - \sum_{(j\oplus k)\circ i = 1} a_ib_k\\
&= C_i
\end{aligned}
$$

The transformation between second row and third row is because each of they denote one situation of result of $i\oplus j$, so they mix to one part.

How to calculate it? Still divide, we know that:
| Do "$\circ$" operater | 0 | 1 |
| :------: | :-: | :-: |
| 0                   | 0 | 0 |
| 1                   | 0 | 1 |

So that:
$$
{A'}_0 = A_0+A_1\\
{A'}_1 = A_0-A_1
$$

Also we can get inverse transform:
$$
A_0 = \frac{A'_0+A'_1}{2}\\
A_1 = \frac{A'_0-A'_1}{2}
$$

Code also easily.

## Full Template

```cpp
/**
 * @file    : FastWalshTransform.cpp 
 * @date    : 2026-01-15
 * @brief   : LuoguP4717
 */

#include <iostream>
#include <vector>

class FastWalshTransform {
private:
    using ll = long long;

    const int MOD;
    int n;
    std::vector<ll> a, b;

    auto pow2(int x) {
        ll ans = 1, a = 2;
        while (x) {
            if (x & 1) ans = ans * a % MOD;
            a = a * a % MOD;
            x >>= 1;
        }
        return ans;
    }
public:
    explicit FastWalshTransform(int n, int MOD) : MOD{MOD}, n{n}, a(n), b(n) {}
    FastWalshTransform(int MOD, const std::vector<ll> a, const std::vector<ll> b)
        : MOD{MOD}, n(a.size()), a{a}, b{b} {}

    void input() {
        for (int i{0}; i < n; i++) {
            std::cin >> a[i];
        }
        for (int i{0}; i < n; i++) {
            std::cin >> b[i];
        }
    }

    auto fwtXor(const std::vector<ll>& a, int flag) -> std::vector<ll> {
        auto trA{a};
        for (int o{2}, k{1}; o <= n; o <<= 1, k <<= 1) {
            for (int i{0}; i < n; i += o) {
                for (int j{0}; j < k; j++) {
                    auto u{trA[i+j]}, v{trA[i+j+k]};
                    trA[i+j] = (flag * (trA[i+j] + v) % MOD + MOD) % MOD;
                    trA[i+j+k] = (flag * (u - trA[i+j+k]) % MOD + MOD) % MOD;
                }
            }
        }
        return trA;
    }

    auto transform() -> std::vector<ll> {
        auto trA{fwtXor(a, 1)};
        auto trB{fwtXor(b, 1)};
        std::vector<ll> trC(n);
        for (int i{0}; i < n; i++) {
            trC[i] = trA[i] * trB[i] % MOD;
        }
        return fwtXor(trC, pow2(MOD-2));
    }
};

auto main() -> int {
    int n, MOD;
    std::cin >> n >> MOD;
    FastWalshTransform fwt(1<<n, MOD);
    fwt.input();
    auto ans{fwt.transform()};
    for (auto& p : ans) {
        std::cout << p << ' ';
    }
    std::cout << "\n";
    return 0;
}
```

# Summarize

That's all, actually these knowledge doesn't usefull in OI, but we still need learn it...