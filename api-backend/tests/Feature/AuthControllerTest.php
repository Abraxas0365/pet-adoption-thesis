<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_user_and_returns_a_sanctum_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Jamie Doe',
            'email' => 'jamie@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.name', 'Jamie Doe')
            ->assertJsonPath('user.email', 'jamie@example.com')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $this->assertDatabaseHas('users', [
            'name' => 'Jamie Doe',
            'email' => 'jamie@example.com',
        ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $response->json('user.id'),
            'name' => 'pawmatch-web',
        ]);
    }

    public function test_it_rejects_duplicate_emails_and_unconfirmed_passwords(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Jamie Doe',
            'email' => 'existing@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->postJson('/api/register', [
            'name' => 'Jamie Doe',
            'email' => 'new@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'different-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_it_logs_in_and_returns_a_sanctum_token_and_user(): void
    {
        $user = User::factory()->create([
            'name' => 'Jamie Doe',
            'email' => 'jamie@example.com',
            'password' => 'secret-password',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'secret-password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.name', 'Jamie Doe')
            ->assertJsonPath('user.email', 'jamie@example.com')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'pawmatch-web',
        ]);
    }

    public function test_it_rejects_invalid_login_credentials(): void
    {
        User::factory()->create(['email' => 'jamie@example.com']);

        $this->postJson('/api/login', [
            'email' => 'jamie@example.com',
            'password' => 'incorrect-password',
        ])->assertUnauthorized();
    }

    public function test_it_revokes_the_current_token_on_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('pawmatch-web');

        $this->withToken($token->plainTextToken)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }
}
