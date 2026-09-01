import { Controller, Get, Param, Query, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BlogsService } from './blogs.service';

@ApiTags('Storefront Blogs')
@Controller('store/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({ summary: 'List all published blog posts' })
  async listPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const ps = pageSize ? parseInt(pageSize, 10) : 20;
    return this.blogsService.listPublishedPosts(p, ps, category);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all blog categories' })
  async listCategories() {
    return this.blogsService.listCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a specific published blog post by slug' })
  async getPostBySlug(@Param('slug') slug: string) {
    return this.blogsService.getPublishedPostBySlug(slug);
  }

  @Get(':postId/comments')
  @ApiOperation({ summary: 'List approved comments for a post' })
  async getComments(@Param('postId') postId: string) {
    return this.blogsService.getCommentsForPost(postId);
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a post' })
  async addComment(
    @Param('postId') postId: string,
    @Body() body: { content: string },
    @Req() req: Request & { user?: { id: string } },
  ) {
    if (!req.user?.id) throw new Error('Unauthorized');
    return this.blogsService.addComment(postId, req.user.id, body.content);
  }
}
