import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  const prismaService = {
    $queryRaw: jest.fn(),
  } as unknown as PrismaService;

  const controller = new AppController(prismaService);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns health status', async () => {
    prismaService.$queryRaw.mockResolvedValue(1);

    const result = await controller.getHealth();

    expect(prismaService.$queryRaw).toHaveBeenCalled();
    expect(result.status).toBe('ok');
    expect(typeof result.timestamp).toBe('string');
  });
});
