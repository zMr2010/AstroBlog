---
title: Solution Report of String(Easy) Topic
published: 2026-03-12 19:38:13
description: Easy
tags: [Interactive]
category: Solution
draft: true
slug: '202603121938'
---

# LuoguP13270 最小表示法

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P13270)  
> [Reference Blog](https://www.luogu.com.cn/article/sl2n7n1z)

## Hash Tech: How to compare string with dictionary order

Hash & Binary Lifting find the LCP of two string and then compare the next character.

```cpp
std::string s, t;
int len{0};
for (int k{19}; k >= 0; k--) {
    if (getHash(s, 0, len+(1<<k)-1) == getHash(t, 0, len+(1<<k)-1)) {
        len += (1 << k);
    }
}
if (len == std::min(s.size(), t.size())) ; // s == t
else ; // s[len] < t[len]
```
**above code could be wrong*

## Solution

It's difficult to solve a problem on circle so copy string behind it.

Now we should solve below problem:  
Find $i$ hold $\min s[i\dots i+n-1]$

Then we consider how to check it quickly. When we are checking the cyclic isomorphism start with $st$ and $i$.
1. First we find the maximum $j$ hold $s[st\dots st+j-1] = s[i\dots i+j-1]$.
2. Then compare the character $s[st+j]$ and $s[i+j]$.
    - if $s[st+j]$ is better than $s[i+j]$, all string start with $i \le k \le i+j-1$ cannot be answer.
    - otherwise, move $i$ to $\max(st+j+1, i+1)$.

```cpp
#include<bits/stdc++.h>
using namespace std;
const int maxn=2e7;
int n;
string s;
int main() {
	ios::sync_with_stdio(0);
	cin.tie(0),cout.tie(0);
	cin>>n>>s,s=" "+s+s;
	int st=1;
	for(int i=2;i<=n;){
		int j=0;
		for(j=0;j<n && s[st+j]==s[i+j];j++);
		if(j==n) break;
		if(s[st+j]>s[i+j]){
            int m=st;
            st=i,i=max(i+1,m+j+1);
        }
		else i+=j+1;
	}
	for(int i=st;i<=st+n-1;i++) cout<<s[i];
	return 0;
}
```

# LuoguP9873 [EC Final 2021] Beautiful String

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P9873)  
> [Reference Blog](https://www.luogu.com.cn/article/u7fvh865)

We found that beautiful string is of the form `AABCAB`, so we can calculate answer by count `AB`.

Then we can define below two array:
- Let $f[i][j]$ denote, when `AB` $= S[i\dots i + j − 1]$, the number of substrings equal to `AB` that start after position $i + j$.
- Let $g[i][j]$ denote, when `AB` $= S[i\dots i + j − 1]$, the number of substrings before `AB` that are prefixes of `AB`.

Then the answer is $\sum f[i][j]\times g[i][j]$.

Now consider how to calculate these array.

For $f$ calculate the LCP of $s[st\dots st+j-1]$ and 