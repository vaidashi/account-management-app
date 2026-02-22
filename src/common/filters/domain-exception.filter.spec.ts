import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { DomainExceptionFilter } from './domain-exception.filter';

describe('DomainExceptionFilter', () => {
  const makeHost = () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    return { host, response };
  };

  it('maps domain errors to 422 response', () => {
    const adapterHost = { httpAdapter: {} } as unknown as HttpAdapterHost;
    const filter = new DomainExceptionFilter(adapterHost);
    const { host, response } = makeHost();

    filter.catch(
      { code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' },
      host,
    );

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    expect(response.json).toHaveBeenCalledWith({
      error: 'ACCOUNT_NOT_FOUND',
      message: 'Account not found',
    });
  });

  it('delegates non-domain errors to BaseExceptionFilter', () => {
    const adapterHost = { httpAdapter: {} } as unknown as HttpAdapterHost;
    const filter = new DomainExceptionFilter(adapterHost);
    const { host } = makeHost();

    const baseCatch = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);

    filter.catch(new Error('boom'), host);

    expect(baseCatch).toHaveBeenCalled();
    baseCatch.mockRestore();
  });
});
