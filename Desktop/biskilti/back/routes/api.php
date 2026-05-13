<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContactRequestController;
use App\Http\Controllers\Api\ExchangeRequestController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/account', [AccountController::class, 'show']);
Route::patch('/account/profile', [AccountController::class, 'updateProfile']);
Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
Route::patch('/admin/users/{user}', [AdminController::class, 'updateUser']);
Route::patch('/admin/listings/{listing}', [AdminController::class, 'updateListing']);
Route::post('/admin/listings/import', [AdminController::class, 'importListings']);

Route::get('/categories', [CatalogController::class, 'categories']);
Route::get('/products', [CatalogController::class, 'products']);
Route::get('/rentals', [CatalogController::class, 'rentals']);

Route::post('/bookings', [BookingController::class, 'store']);
Route::post('/orders', [OrderController::class, 'store']);
Route::post('/listing-images', [ListingController::class, 'uploadImage']);
Route::get('/listings', [ListingController::class, 'index']);
Route::post('/listings', [ListingController::class, 'store']);
Route::patch('/listings/{listing}', [ListingController::class, 'update']);
Route::post('/exchanges', [ExchangeRequestController::class, 'store']);
Route::post('/contact-requests', [ContactRequestController::class, 'store']);
