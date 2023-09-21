require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const jwt = require('jsonwebtoken');

const jwtRouter = express.Router();

const posts = 
[
    {
        username: 'John',
        title: 'Post 1'
    },
    {
        username: 'Jo',
        title: 'Post 2'
    }
];

let refreshTokens = [];

jwtRouter.get('/', (req, res) => 
{
    res.send('hi!');
})

jwtRouter.get('/posts', authMiddleware, (req, res) => 
{
    res.json(posts);
})

jwtRouter.post('/login', (req, res) => 
{
    const username = req.body.username;
    const user = { name: username };

    // 토큰 생성
    const accessTocken = jwt.sign(user, 
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30s'});

    // 주로 DB에 저장
    const refreshToken = jwt.sign(user, 
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d'});

    refreshTokens.push(refreshToken);

    // Refresh Token을 쿠키에 넣기
    res.cookie('jwt', refreshToken, 
    {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    });

    res.json({accessTocken });
});

jwtRouter.get('/refresh', (req, res) => 
{
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    // 주로 이부분에서 DB에 저장된 Refresh Token과 비교
    const refreshToken = cookies.jwt;
    if (!refreshTokens.includes(refreshToken))
    {
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => 
    {
        if (err) return res.sendStatus(403);
        const accessToken = jwt.sign({ user: user.name }, 
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s'});

        res.json({accessToken});
    })
})

function authMiddleware(req, res, next) 
{
    // 토큰을 request headers에서 가져오기
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => 
    {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = jwtRouter;