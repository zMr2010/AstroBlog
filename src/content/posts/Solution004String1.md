---
title: Solution Report of String(Easy) Topic
published: 2026-03-26 19:38:13
description: Easy
tags: [Interactive]
category: Solution
draft: false
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

For $f$, calculate the LCP length of all pair of $s[i\dots n]$ and $s[j\dots n]$ then save them in $f[i][LCP]$, suffixing f.  
For $g$, count the number of LCP of $s[i\dots n]$ and $s[i-j\dots n]$ which length is greater than $j$.

```cpp
cin >> S;
n = S.length(); S = ' ' + S;
for(int i = n; i; i--)
    for(int j = i; j <= n; j++)
        if(S[i] == S[j])
            lcp[i][j] = lcp[i + 1][j + 1] + 1;
for(int i = 2; i <= n; i++)
    for(int j = i + 3; j < n; j++) {
        int k = min(j - i - 1, lcp[i][j]);
        if(k >= 2) f[i][k]++;
    }
for(int i = 2; i <= n; i++)
    for(int j = n - 1; j > 1; j--) f[i][j] += f[i][j + 1];
for(int i = 2; i <= n; i++)
    for(int j = 1; j <= min(i - 1, n - i + 1); j++) 
        if(lcp[i - j][i] >= j) g[i][j]++;
for(int i = 1; i <= n; i++)
    for(int j = 1; j <= n; j++) g[i][j] += g[i][j - 1];
long long ans = 0;
for(int i = 2; i <= n; i++)
    for(int j = 2; j <= n; j++) ans += 1ll * f[i][j] * g[i][j - 1];
cout << ans << '\n';
```

# LuoguP9016 [USACO23JAN] Find and Replace G

These kind of question which after operation can cover early operation we can all consider it from back to front.

We can build a DAG to solve this question. Use examples as demonstrations.

```
a ab
a bc
c de
b bbb
```

Build 5 nodes for letter `a` to `e`, then build graph from last operation.

```
      (7,#,sz=3)
       /      \
 (6,#,2)      (2,'b')
   /    \
(2,'b') (2,'b')
```

Keep the structure of 2-branch tree, but reuse same node.

Below is operator `c de`:

```
   (8,#,2)
   /    \
(4,'d')(5,'e')
```

Then we can see how to combine two subtree (operator `a bc`):

```
           (9,#,5)
          /       \
     (7,#,3)    (8,#,2)
      /   \      /    \
  (6,#)    b    d      e
   / \
  b   b
```

Final version:

```
                    (10,#,8)
                   /        \
             (9,#,5)      (7,#,3)
            /      \      /      \
       (7,#,3)  (8,#,2) (6,#)    b
        /   \    /   \   /  \
    (6,#)   b   d     e b    b
     / \
    b   b
```

Then we can get answer from the tree size.

# LuoguP7114 [NOIP2020] 字符串匹配

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P7114)  
> [Reference Blog](https://www.luogu.com.cn/article/bti82yh8)

*It's a really perfect tutorial. I don't even know what else to supplement.*

We define the $i$-th element of Z-array denote the length of LCP of $s[0\dots n-1]$ and $s[i\dots n-1]$.

![Example](https://cdn.luogu.com.cn/upload/image_hosting/16k5feoc.png)

From the image we can know that $K$ in problem statement can take any integer from $1$ to 
$$
\left\lfloor\frac{z[i]}{i}\right\rfloor + 1
$$

$i$ is the length of cyclic section. You can understand this expression by the example image. Red part equal to Orange part and Orange part equal to Orange part. Similarly find Red, Orange and Green part are all equal so $3$ is the length of cyclic section.

Then we need focus on the number of each letter appear. Classify and discuss the parity of $K$. Define function $f(i,j)$ denote the number of letter wich appear odd times in $s[i\dots j]$. Let $t$ denote all value selection scheme for $K$, the scheme for $K$ to be a odd number should be $todd = t - t/2$, for even number should be $teven = t/2$.

1. When $K$ is an odd, we should find the number of $j\ (j\le i)$ which satisfy $f(0,j) \le f(i,n-1)$ is denoted as $t1$, it will provide $todd \times t1$ contribution. 
![](https://cdn.luogu.com.cn/upload/image_hosting/iv72qpb3.png)

2. When $K$ is an even, we should find the number of $j\ (j\le i)$ which satisfy $f(0,j) \le f(0,n-1)$ is denoted as $t2$, that is because the number of cyclic section is even, even if the letter appear for odd times, it finally turned to even times. So the letter which appear odd time equal to whole string. Answer will increase $teven \times t2$. 
![](https://cdn.luogu.com.cn/upload/image_hosting/6pxq01fv.png)

# LuoguP3167 [CQOI2014] 通配符匹配

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3167)  
> [Reference Blog](https://www.luogu.com.cn/article/e4th1mfd)

OK this problem can protrude the charm of DFS. Most of turorial are using difficult algorithm such as KMP, ACAM but forget the most easy algorithm.

```cpp
#include<bits/stdc++.h>
using namespace std;
char ch[100001],wzc[100001];
int n;

bool _doudou(int x,int y)// Start brute-force search, search from back to front to avoid some tricky test cases, also makes implementation easier
{
    if(y==0)// If the pattern string is fully matched
    {
        if(x==0)return 1;// If the wildcard string is also fully consumed, then it's definitely correct
        for(int i=x;i>0;i--)// Check remaining '*' characters
            if(ch[i]!='*')return 0;// If anything other than '*', then it fails
        return 1;// Otherwise it's fine
    }

    if(!x)return 0;// If the wildcard string finishes first, then it must fail

    if(ch[x]=='*')// If we encounter a '*'
    {
        for(int i=y;i>=0;i--)// Try matching from all remaining positions.
                             // The time complexity looks high, but in practice most branches terminate quickly.
            if(_doudou(x-1,i))return 1;
    }
    else
    {
        if(wzc[y]==ch[x]||ch[x]=='?')
            return _doudou(x-1,y-1);// If it's '?', move both strings one position forward
        else return 0;// Match failed
    }
}

int main()
{
    scanf("%s%d",ch+1,&n);
    int len=strlen(ch+1);

    while(n--)
    {
        scanf("%s",wzc+1);

        if(_doudou(len,strlen(wzc+1)))
            printf("YES\n");
        else
            printf("NO\n");
    }

    return 0;
}
```

# LuoguP3082 [USACO13MAR] Necklace G

> **Useful Link**  
> [Problem Statement](https://www.luogu.com.cn/problem/P3082)  
> [Reference Blog](https://www.luogu.com.cn/article/vhpibjbr)

This is a problem which using KMP to optmize DP.

Let $f_{i,j}$ denotes, the maximum we can keep when the first $i$-th letter of $a$ map the first $j$-th letter of $b$ exactly. Then we can get a easy transition

$$
f_{i+1,k} = \max\{f_{i+1,k} ,f_{i,j}+1\}
$$

Then we should consider how to calculate $k$ quickly. Let $g_{i,j}$ denotes $k$ when map the first $i$-th letter of $b$ exactly and then next letter is $j$. Then we can get below transition.

$$
g_{i,j} =
\begin{cases}
i+1 & b[i+1] == j\\
g_{nxt_{i}, j} & \operatorname{otherwise.}
\end{cases}
$$

Coding is easy.

