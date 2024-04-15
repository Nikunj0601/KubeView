export class JWTExtractDto {
  id: number;
  email: string;
  username: string;
  githubAccessToken: string;
  iat: number;
  exp: number;
}
