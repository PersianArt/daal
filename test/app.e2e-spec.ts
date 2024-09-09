import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3002);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3002');
  });

  afterAll(async () => {
    await app.close();
  });

  const userDto: AuthDto = {
    email: 'vlad@gmail.com',
    password: '123',
  };

  describe('Auth', () => {
    describe('Signup', () => {
      it('Should signup successfully', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(userDto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should signin successfully', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(userDto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });

    describe('Get me', () => {
      it('Should get active user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .stores('userId', 'id');
      });
    });
  });

  describe('Transaction', () => {
    describe('Get transactions and active user', () => {
      it('Transactions should be null', () => {
        return pactum
          .spec()
          .get('/transaction')
          .expectStatus(200)
          .expectBody([]);
      });

      it('User balance should be 0', () => {
        return pactum
          .spec()
          .get('/balance')
          .withQueryParams('user_id', '$S{userId}')
          .expectStatus(200)
          .expectJsonMatch({ balance: 0 });
      });
    });

    describe('Create transaction', () => {
      it('Transaction should created successfully', () => {
        return pactum
          .spec()
          .post('/money')
          .withBody({
            user_id: '$S{userId}',
            amount: 333,
          })
          .expectStatus(201);
      });

      it('Transactions should not be null', () => {
        return pactum
          .spec()
          .get('/transaction')
          .expectStatus(200)
          .expectJsonLength(1);
      });

      it('User balance should be changed', () => {
        return pactum
          .spec()
          .get('/balance')
          .withQueryParams('user_id', '$S{userId}')
          .expectStatus(200)
          .expectJsonMatch({ balance: 333 });
      });
    });
  });
});
