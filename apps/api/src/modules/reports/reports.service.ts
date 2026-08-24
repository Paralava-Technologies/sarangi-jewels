import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesSummary(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
      },
      include: {
        lines: true
      }
    });

    const totalRevenueCents = orders.reduce((sum, order) => sum + (order.totalCents || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValueCents = totalOrders > 0 ? totalRevenueCents / totalOrders : 0;
    
    const totalRentals = orders.reduce((sum, order) => sum + order.lines.filter(l => l.isRental).length, 0);

    const totalMakeupSessions = await this.prisma.makeupSession.count({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ['CANCELLED'] }
      }
    });

    return {
      totalRevenueCents,
      totalOrders,
      averageOrderValueCents,
      totalRentals,
      totalMakeupSessions,
      period: { start, end }
    };
  }

  async getTopProducts(limit: number = 10) {
    const topProducts = await this.prisma.orderLine.groupBy({
      by: ['productId', 'productName'],
      _sum: {
        quantity: true,
        lineTotalCents: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit,
    });
    
    return topProducts;
  }

  async getRecentTransactions(limit: number = 10) {
     return this.prisma.payment.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            orders: {
                select: {
                    orderNumber: true,
                    user: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                }
            }
        }
     });
  }

  async getTopCustomers(limit: number = 5) {
    const customers = await this.prisma.user.findMany({
      include: {
        orders: {
          where: {
            status: { notIn: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
          },
          select: { totalCents: true }
        }
      }
    });

    const withRevenue = customers.map(c => {
      const revenue = c.orders.reduce((sum, o) => sum + (o.totalCents || 0), 0);
      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim() || c.email,
        email: c.email,
        revenueCents: revenue,
        orderCount: c.orders.length
      };
    });

    return withRevenue
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, limit);
  }

  async getDailyRevenue(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
      },
      select: { createdAt: true, totalCents: true }
    });

    // Group by YYYY-MM-DD
    const dailyMap = new Map<string, number>();
    for (const o of orders) {
      const dateKey = o.createdAt.toISOString().split('T')[0];
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + (o.totalCents || 0));
    }

    // Fill missing dates
    const data = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      data.push({
        date: dateKey,
        revenueCents: dailyMap.get(dateKey) || 0
      });
    }

    return data;
  }

  async getDailyBookings(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        lines: { some: { isRental: true } }
      },
      select: { createdAt: true }
    });

    const makeupSessions = await this.prisma.makeupSession.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ['CANCELLED'] }
      },
      select: { createdAt: true }
    });

    const dailyMap = new Map<string, { rentals: number, makeup: number }>();
    
    for (const o of orders) {
      const dateKey = o.createdAt.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, { rentals: 0, makeup: 0 });
      dailyMap.get(dateKey)!.rentals += 1;
    }

    for (const m of makeupSessions) {
      const dateKey = m.createdAt.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, { rentals: 0, makeup: 0 });
      dailyMap.get(dateKey)!.makeup += 1;
    }

    const data = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const stats = dailyMap.get(dateKey) || { rentals: 0, makeup: 0 };
      data.push({
        date: dateKey,
        rentals: stats.rentals,
        makeup: stats.makeup
      });
    }

    return data;
  }

  async getUserAcquisition() {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 5); // 6 months total including current
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const categories = await this.prisma.category.findMany({ select: { name: true } });
    const categoryNames = categories.map(c => c.name);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      include: {
        orders: {
          orderBy: { createdAt: 'asc' },
          take: 1,
          include: {
            lines: {
              take: 1
            }
          }
        }
      }
    });

    // Get unique product IDs
    const productIds = new Set<string>();
    users.forEach(u => {
      if (u.orders.length > 0 && u.orders[0].lines.length > 0) {
        productIds.add(u.orders[0].lines[0].productId);
      }
    });

    // Fetch products with their categories
    const products = await this.prisma.product.findMany({
      where: { id: { in: Array.from(productIds) } },
      include: { category: true }
    });

    const productCategoryMap = new Map<string, string>();
    products.forEach(p => {
      if (p.category) {
        productCategoryMap.set(p.id, p.category.name);
      }
    });

    const monthlyMap = new Map<string, any>();
    for (const u of users as any[]) {
      const monthKey = u.createdAt.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(monthKey)) {
        const initialMap: any = { Total: 0 };
        categoryNames.forEach(c => initialMap[c] = 0);
        monthlyMap.set(monthKey, initialMap);
      }
      
      const m = monthlyMap.get(monthKey);
      m.Total += 1;
      
      let acquiredCategory = null;
      if (u.orders.length > 0 && u.orders[0].lines.length > 0) {
        const pId = u.orders[0].lines[0].productId;
        acquiredCategory = productCategoryMap.get(pId);
      }
      
      if (acquiredCategory && categoryNames.includes(acquiredCategory)) {
        m[acquiredCategory] += 1;
      }
    }

    const data = [];
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      const monthKey = d.toISOString().substring(0, 7);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      
      const mData = monthlyMap.get(monthKey) || { Total: 0 };
      categoryNames.forEach(c => {
        if (mData[c] === undefined) mData[c] = 0;
      });

      data.push({
        monthKey,
        month: monthName,
        ...mData
      });
    }

    return { data, categories: categoryNames };
  }

  async getOrdersByStatus() {
    const stats = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    return stats.map(s => ({ status: s.status, count: s._count.id }));
  }

  async getProductHeatmap(query?: Record<string, string>) {
    const end = query?.endDate ? new Date(query.endDate) : new Date();
    const start = query?.startDate ? new Date(query.startDate) : new Date();
    
    if (!query?.startDate) {
      start.setMonth(end.getMonth() - 5); // default last 6 months
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    
    const view = query?.view || 'monthly'; // 'monthly' | 'weekly'
    const productNameFilter = query?.productName || '';
    const categoryFilter = query?.category || '';
    const isRentalFilter = query?.isRental === 'true';

    const orderWhere: any = {
      createdAt: { gte: start, lte: end },
      status: { notIn: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
    };

    const lineWhere: any = { order: orderWhere };
    if (isRentalFilter) {
      lineWhere.isRental = true;
    }
    if (productNameFilter) {
      lineWhere.productName = { contains: productNameFilter, mode: 'insensitive' };
    }
    
    if (categoryFilter) {
      const productsInCategory = await this.prisma.product.findMany({
        where: { category: { name: { contains: categoryFilter, mode: 'insensitive' } } },
        select: { id: true }
      });
      lineWhere.productId = { in: productsInCategory.map(p => p.id) };
    }

    const orderLines = await this.prisma.orderLine.findMany({
      where: lineWhere,
      include: {
        order: { select: { createdAt: true } }
      }
    });

    const productsSet = new Set<string>();
    const timeKeysSet = new Set<string>();
    const dataMap: Record<string, Record<string, number>> = {};

    function getWeekKey(d: Date) {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      return monday.toISOString().substring(0, 10);
    }

    // prefill timeKeys for the date range
    if (view === 'monthly') {
      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        timeKeysSet.add(d.toISOString().substring(0, 7));
      }
    } else {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
        timeKeysSet.add(getWeekKey(d));
      }
    }

    for (const line of orderLines) {
      const pName = line.productName;
      const createdAt = line.order.createdAt;
      const tKey = view === 'monthly' ? createdAt.toISOString().substring(0, 7) : getWeekKey(createdAt);
      
      productsSet.add(pName);
      timeKeysSet.add(tKey);
      
      if (!dataMap[pName]) dataMap[pName] = {};
      if (!dataMap[pName][tKey]) dataMap[pName][tKey] = 0;
      
      dataMap[pName][tKey] += line.quantity;
    }

    const months = Array.from(timeKeysSet).sort();
    const products = Array.from(productsSet).sort();
    
    for (const p of products) {
      for (const m of months) {
        if (dataMap[p][m] === undefined) {
          dataMap[p][m] = 0;
        }
      }
    }

    return { months, products, data: dataMap, view };
  }

  async getProductOrders(query?: Record<string, string>) {
    const end = query?.endDate ? new Date(query.endDate) : new Date();
    const start = query?.startDate ? new Date(query.startDate) : new Date();
    
    if (!query?.startDate) {
      start.setMonth(end.getMonth() - 5);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    
    const productNameFilter = query?.productName || '';
    const categoryFilter = query?.category || '';
    const isRentalFilter = query?.isRental === 'true';

    const orderWhere: any = {
      createdAt: { gte: start, lte: end },
      status: { notIn: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
    };

    const lineWhere: any = { order: orderWhere };
    if (isRentalFilter) {
      lineWhere.isRental = true;
    }
    if (productNameFilter) {
      lineWhere.productName = { contains: productNameFilter, mode: 'insensitive' };
    }
    
    if (categoryFilter) {
      const productsInCategory = await this.prisma.product.findMany({
        where: { category: { name: { contains: categoryFilter, mode: 'insensitive' } } },
        select: { id: true }
      });
      lineWhere.productId = { in: productsInCategory.map(p => p.id) };
    }

    const orderLines = await this.prisma.orderLine.findMany({
      where: lineWhere,
      include: {
        order: { select: { orderNumber: true, createdAt: true, status: true, user: { select: { email: true, firstName: true, lastName: true } } } }
      },
      orderBy: { order: { createdAt: 'desc' } },
      take: 100 // limit to 100 for now to prevent massive payloads
    });

    return orderLines;
  }
}
