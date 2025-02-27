import { Controller, Post, Body } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Controller("auth")
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post("login")
  async login(@Body() body: { username: string; password: string }) {
    // This is just for testing - in production, you should verify credentials
    return {
      access_token: this.jwtService.sign({ username: body.username, sub: "1" }),
    };
  }
}
