# Why should I use Bcrypt to hash passwords

- 온라인에서 password는 데이터를 안전하게 보호하는데 가장 중요한 역할을한다. 

## Plain Text Passwords
- plain-text password는 말 그대로 비밀번호 그대로 Database에 저장하는 것이다. Req and Res 사이에서 발생하는 password를 갈취했을때 plain-text-password라면 이미 해킹 당한 것과 다름이 없어진다. 그러므로, hash 방식을 이용해 암호화된 방식으로 비밀번호를 저장해야한다.

## One way hash
- one-way hash password를 이용하면 Server는 authentication 과정에서 plain-text-password 형태로 비밀번호를 저장하지않는다. password는 조금 더 안전하게 보호 할 수 있는 hashing algorithm을 이용해서 암호화된 방식으로 저장된다. 하지만, 이 방법 또한 그렇게 안전하다고 할 수는 없다. 더 안전한 방법은 Random Salt 값을 기존의 password와 조합해 암호화하는 방식이다.

## 'Salting' the password
- "salt"는 긴 string of bytes이다. hacker가 나의 source code에 접근해 salt 값을 알아내지 못하는 이상 해킹은 거의 불가능하다.

## Random 'salt' for each user
- 하지만, source code의 환경 변수로 설정한 salt 값 또한 해킹의 우려가 있기 때문에 더 안전한 방법은 salt 값을 매번 무작위하게 발생시키는 방법이다. 단점은, 기존의 방식보다 시간이 오래걸린다.

## 예시
``` 
hash("paul") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
hash("rohan") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366
hash("12345") = c0e81794384491161f1777c232bc6bd9ec38f616560b120fda8e90f383853542
```

Salted hashing — Generating random bytes (the salt) and combining it with the password before hashing creates unique hashes across each user’s password. If two users have the same password they will not have the same password hash. This is to prevent rainbow table attacks which can reverse hashed passwords using common hashing functions that do not utilize a salt.

Uses Hashing algorithms that are one way functions. They turn any amount of data into a fixed-length “fingerprint” that cannot be reversed. They also have the property that if the input changes by even a tiny bit, the resulting hash is completely different (see the example above). This is great for protecting passwords, because we want to store passwords in a form that protects them even if the password file itself is compromised, but at the same time, we need to be able to verify that a user’s password is correct.
The general workflow for account registration and authentication in a hash-based account system is as follows:

1> The user creates an account.

2> Their password is hashed and stored in the database. At no point is the plain-text (unencrypted) password ever written to the hard drive.

3> When the user attempts to login, the hash of the password they entered is checked against the hash of their real password (retrieved from the database).

4> If the hashes match, the user is granted access. If not, the user is told they entered invalid login credentials.

5> Steps 3 and 4 repeat every time someone tries to login to their account.
bcrypt works in 2 steps — The regular steps are A> Generate the salt first (if err throw err else give me the salt)
and then B> hash the password with the generated salt (passing a cb so if there’s error throw error else give me the hash).
So from official doc the below function is for the first step of generating the salt and hashing

```
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c0/\/", salt);

// To has a password the ES6 Async way is combine them both without blocking any other
bcrypt.getSalt(10, (err, salt) => {
    bcrypt.hash("B4c0/\/", salt, (err, hash) => {

    } )
})
```

https://medium.com/@paulrohan/how-bcryptjs-works-90ef4cb85bf4