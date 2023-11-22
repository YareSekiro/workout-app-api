import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import UserFactory from '../../database/factories/UserFactory'

test.group('Users | Register', (group) => {

    // Pour s'assurer que la db rollback après chaque test et ainsi ne pas avoir des problèmes
    // de données créer par les tests
    group.each.setup(async () => {
        await Database.beginGlobalTransaction()
        return () => Database.rollbackGlobalTransaction()
    });

    test('ensure user can register', async ({client}) => {
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini@example.com",
            username: "ad.remondini",
            password: "secret1234",
            password_confirmation: "secret1234",
        });

        response.assertStatus(201);
    })

    test('ensure user cannot register with existing email', async ({client}) => {
        // Given I have a user with email ad.remondini@example.com
        await UserFactory.merge({email: "ad.remondini@example.com"}).create();
        // When I try to register with the same email
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini@example.com",
            username: "ad.remondini",
            password: "secret1234",
            password_confirmation: "secret1234",
        });
        // Then I should get an error
        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "email": [
                    "Cette adresse email est déjà utilisée"
                ]
            }
        })
    });

    test('ensure user cannot register with invalid email', async ({client}) => {
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini",
            username: "JunMoXiang",
            password: "secret1234",
            password_confirmation: "secret1234",
        });

        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "email": [
                    "L'adresse email doit être valide"
                ]
            }
        })

    });

    test('ensure user cannot register with email longer than 255 characters', async ({client}) => {
        const response = await client.post('/api/v1/auth/register').json({
            email: `${Array(256).fill('a').join('')}@example.com`,
            username: "JunMoXiang",
            password: "secret1234",
            password_confirmation: "secret1234",
        });

        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "email": [
                    "L'adresse email doit contenir au plus 255 caractères"
                ]
            }
        })

    });

    test('ensure user cannot register with existing username', async ({client}) => {
        // Given I have a user with email ad.remondini@example.com
        await UserFactory.merge({username: "ad.remondini"}).create();
        // When I try to register with the same email
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini@example.com",
            username: "ad.remondini",
            password: "secret1234",
            password_confirmation: "secret1234",
        });
        // Then I should get an error
        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "username": [
                    "Ce nom d'utilisateur est déjà utilisé"
                ]
            }
        })
    });

    test('ensure user cannot register with username shorter than 4 characters', async ({client}) => {
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini@example.com",
            username: "JMX",
            password: "secret1234",
            password_confirmation: "secret1234",
        });

        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "username": [
                    "Le nom d'utilisateur doit contenir au moins 4 caractères"
                ]
            }
        })
    });

    test('ensure user cannot register with username longer than 25 characters', async ({client}) => {
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini@example.com",
            username: "JunMoXiangJunMoXiangJunMoXiang",
            password: "secret1234",
            password_confirmation: "secret1234",
        });

        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "username": [
                    "Le nom d'utilisateur doit contenir au plus 25 caractères"
                ]
            }
        })

    });

    test('ensure user cannot register with password shorter than 8 characters', async ({client}) => {
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini@example.com",
            username: "ad.remondini",
            password: "secret",
            password_confirmation: "secret",
        });

        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "password": [
                    "Le mot de passe doit contenir au moins 8 caractères"
                ]
            }
        })

    });

    test('ensure user cannot register with password longer than 180 characters', async ({client}) => {
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini@example.com",
            username: "ad.remondini",
            password: `${Array(181).fill('a').join('')}`,
            password_confirmation: `${Array(181).fill('a').join('')}`,
        });

        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "password": [
                    "Le mot de passe doit contenir au plus 180 caractères"
                ]
            }
        })
    });

    test('ensure user cannot register with password that does not match', async ({client}) => {
        const response = await client.post('/api/v1/auth/register').json({
            email: "ad.remondini@example.com",
            username: "ad.remondini",
            password: "secret1234",
            password_confirmation: "secret12345",
        });

        response.assertStatus(422);
        response.assertBodyContains({
            "status": 422,
            "path": "/api/v1/auth/register",
            "code": "E_VALIDATION_FAILURE",
            "message": "Validation error",
            "errors": {
                "password_confirmation": [
                    "Les mots de passe ne correspondent pas"
                ]
            }
        })

    });





});