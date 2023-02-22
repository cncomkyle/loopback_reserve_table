// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';
import {
  TokenService
} from '@loopback/authentication';
import {
  TokenServiceBindings
} from '@loopback/authentication-jwt';

import {inject} from '@loopback/core';
import {getModelSchemaRef, HttpErrors, post, requestBody} from '@loopback/rest';
import {Credentials} from '../models';
import usersModel from '../models/users.model';

export class UserController {

  @inject(TokenServiceBindings.TOKEN_SERVICE)
  public jwtService: TokenService

  constructor() {

  }


  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(@requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(Credentials, {
          title: 'loginCheck',
        }),
      },
    },
  }) credential: Credentials,
  ): Promise<{token: string, role: string, userId: string}> {
    const checkUser = new usersModel({
      userName: credential.userName,
      password: credential.password,
    })
    try {
      const foundUser = await usersModel.findOne({userName: {$eq: credential.userName}, password: {$eq: credential.password}, }, {consistency: 2});
      if (!foundUser) {
        throw new HttpErrors.Unauthorized("Invalid credential");
      }
      // // create a JSON Web Token based on the user profile
      console.log(foundUser)
      const token = await this.jwtService.generateToken(foundUser);

      return {token: token, role: foundUser.role, userId: foundUser.id};
    } catch (error) {
      console.error(error);
      throw new HttpErrors.Unauthorized("Invalid credential");
    }

  }
}
