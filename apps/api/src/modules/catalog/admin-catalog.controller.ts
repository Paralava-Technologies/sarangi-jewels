import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UserRole } from '@prisma/client';
import type { CreateProductInput, UpdateProductInput, CreateCategoryInput, UpdateCategoryInput } from '@sarangi/validation';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CatalogService } from './catalog.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCatalogController {
  constructor(private catalog: CatalogService) {}

  @Get('categories')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  listCategories(@Query() query: Record<string, unknown>) {
    return this.catalog.listCategories(query);
  }

  @Post('categories')
  @Roles(UserRole.ADMIN)
  createCategory(@Body() body: CreateCategoryInput) {
    return this.catalog.createCategory(body);
  }

  @Patch('categories/:id')
  @Roles(UserRole.ADMIN)
  updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryInput) {
    return this.catalog.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @Roles(UserRole.ADMIN)
  deleteCategory(@Param('id') id: string) {
    return this.catalog.deleteCategory(id);
  }

  @Get('products')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  listProducts(@Query() query: Record<string, unknown>) {
    return this.catalog.listProducts(query, false);
  }

  @Post('products')
  @Roles(UserRole.ADMIN)
  createProduct(@Body() body: CreateProductInput) {
    return this.catalog.createProduct(body);
  }

  @Patch('products/:id')
  @Roles(UserRole.ADMIN)
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductInput) {
    return this.catalog.updateProduct(id, body);
  }

  @Delete('products/:id')
  @Roles(UserRole.ADMIN)
  deleteProduct(@Param('id') id: string) {
    return this.catalog.deleteProduct(id);
  }

  @Post('upload')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'public', 'uploads'), // dist/modules/catalog -> dist/modules -> dist -> apps/api -> public/uploads
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    const port = process.env.API_PORT ?? 3001;
    const publicUrl = process.env.API_URL ?? `http://localhost:${port}`;
    return { data: { url: `${publicUrl}/public/uploads/${file.filename}` } };
  }
}
