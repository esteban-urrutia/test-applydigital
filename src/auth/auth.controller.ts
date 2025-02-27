import { Controller, Post, Body } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

class LoginDto {
  username: string;
  password: string;
}

class LoginResponseDto {
  access_token: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiBody({
    type: LoginDto,
    description: "User credentials",
    examples: {
      example1: {
        value: {
          username: "johndoe",
          password: "password123",
        },
        summary: "User login example",
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successfully logged in",
    type: LoginResponseDto,
    schema: {
      example: {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  })
  async login(@Body() body: { username: string; password: string }) {
    // This is just for testing - in production, you should verify credentials
    return {
      access_token: this.jwtService.sign({ username: body.username, sub: "1" }),
    };
  }
}
