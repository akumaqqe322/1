import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/user.decorator';

@ApiTags('Identity')
@ApiSecurity('x-user-id')
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles('admin', 'lawyer', 'partner')
  @ApiOperation({ summary: 'Get current user profile session info' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid x-user-id' })
  getMe(@User() user: any) {
    // The RolesGuard already resolved the user from the database
    // and attached it to the request. The @User decorator extracts it.
    return user;
  }
}
