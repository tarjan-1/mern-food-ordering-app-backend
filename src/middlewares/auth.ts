import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer"
import jwt from "jsonwebtoken"; 
import "dotenv/config"
import User from "../models/user";

declare global {
  namespace Express {
    interface Request {
      userId: string,
      auth0Id: string
    }
  }
}

// export const jwtCheck = auth({
//   audience: process.env.AUDIENCE,
//   issuerBaseURL: process.env.ISSUER_BASE_URL,
//   tokenSigningAlg: process.env.TOKEN_SIGNING_ALG
// });

// this only till issue fixes
export const jwtCheck = auth({
  audience: 'mern-food-ordering-app-api',
  issuerBaseURL: 'https://dev-47qwftgw4wdun0wv.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});
  
export const jwtParse = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if(!authorization || !authorization.startsWith("Bearer ")){
    return res.sendStatus(401);
  }

  const token = authorization.split(" ")[1];
  try {
    const decoded = jwt.decode(token)as jwt.JwtPayload;
    const auth0Id = decoded.sub;

    const user = await User.findOne({auth0Id})

    if(!user){
      return res.sendStatus(401);
    }

    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();

    next();
    
  } catch (error) {
    return res.sendStatus(401);
  }
}