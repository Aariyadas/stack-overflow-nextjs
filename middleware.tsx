import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
    publicRoutes:[
        '/',
        '/api/webhook',
        '/question/:id',
        '/tag',
        '/tags/:id',
        '/profile/:id',
        '/community',
        '/jobs'
    ],
    ignoredRoutes:[
        '/api/webhook','/api/chatgpt'
    ]
});
 
export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 