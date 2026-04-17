import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should delegate register to AuthService', async () => {
    const dto = {
      email: 'new@example.com',
      password: 'secret123',
      displayName: 'New User',
    };
    const expected = { accessToken: 'token' };

    mockAuthService.register.mockResolvedValue(expected);

    await expect(controller.register(dto)).resolves.toEqual(expected);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should delegate login to AuthService', async () => {
    const dto = { email: 'user@example.com', password: 'secret123' };
    const expected = { accessToken: 'token' };

    mockAuthService.login.mockResolvedValue(expected);

    await expect(controller.login(dto)).resolves.toEqual(expected);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('should delegate getMe using req.user.id', async () => {
    const req = { user: { id: 'u-1', email: 'a@a.com', role: 'CITIZEN' } };
    const expected = { id: 'u-1', email: 'a@a.com' };

    mockAuthService.getMe.mockResolvedValue(expected);

    await expect(controller.getMe(req)).resolves.toEqual(expected);
    expect(mockAuthService.getMe).toHaveBeenCalledWith('u-1');
  });
});
