import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Admin Blogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/blogs')
export class AdminBlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({ summary: 'List all posts for admin (including unpublished)' })
  async listPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const ps = pageSize ? parseInt(pageSize, 10) : 20;
    return this.blogsService.adminListPosts(p, ps);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single post by ID' })
  async getPost(@Param('id') id: string) {
    return this.blogsService.adminGetPost(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new blog post' })
  async createPost(@Body() body: any) {
    return this.blogsService.createPost(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog post' })
  async updatePost(@Param('id') id: string, @Body() body: any) {
    return this.blogsService.updatePost(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog post' })
  async deletePost(@Param('id') id: string) {
    return this.blogsService.deletePost(id);
  }

  @Get('comments/list')
  @ApiOperation({ summary: 'List all comments for moderation' })
  async listComments(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const ps = pageSize ? parseInt(pageSize, 10) : 20;
    return this.blogsService.adminListComments(p, ps);
  }

  @Patch('comments/:id/status')
  @ApiOperation({ summary: 'Update a comment status (APPROVED, REJECTED)' })
  async updateCommentStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.blogsService.adminUpdateCommentStatus(id, body.status);
  }
}
