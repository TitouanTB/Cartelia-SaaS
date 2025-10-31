import { prisma } from './prisma';

export async function trackScan(restaurantId: number, type: string): Promise<void> {
  await prisma.scan.create({
    data: {
      restaurantId,
      type,
    },
  });
}

export async function getScansCount(restaurantId: number): Promise<number> {
  return prisma.scan.count({
    where: {
      restaurantId,
    },
  });
}

export async function getScansByType(
  restaurantId: number
): Promise<{ type: string; count: number }[]> {
  const scans = await prisma.scan.groupBy({
    by: ['type'],
    where: {
      restaurantId,
    },
    _count: {
      type: true,
    },
  });

  return scans.map(scan => ({
    type: scan.type,
    count: scan._count.type,
  }));
}
