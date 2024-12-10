---
title: EclatShop
publishDate: 2024-09-01 00:00:00
img: /assets/EclatShop.png
img_alt: screen shot of the interface
description: |
  Eclat Shop is a robust e-commerce platform tailored for selling computer components. Built with Symfony for backend operations, React with TypeScript for the frontend, and Docker for deployment, it ensures a seamless and efficient user experience.
tags:
  - Symfony
  - NextJS
  - React
  - TypeScript
  - Docker
---

# Eclat Shop E-Commerce

## Introduction

Eclat Shop is a powerful website designed for e-commerce platforms, particularly focused on the sale of computer components. It leverages the Symfony framework for backend operations, React with TypeScript for the frontend, and Docker for efficient deployment.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Docker**: For creating and managing containers.

### Clone the project:

To clone the repository and start setting up the project, use the following command in your terminal:

Step 1 : Clone the repository
`git clone https://repository.git`

Step 2: Set up the .env configurations. Add one .env file at the root directory and another within the app directory.
`cd app/`

Step 2: Launch Docker and enter the following command.
`docker compose up -d --build`

## API Reference

### Users

- **Register a User**: `POST /api/register` - Creates a new user account.
- **User Login**: `POST /api/login` - Authenticates a user and returns an authorization token.

### Products

- **List Products**: `GET /api/products` - Retrieves all products.
- **Single Product**: `GET /api/products/{productId}` - Fetches details of a specific product.
- **Add Product**: `POST /api/products` - Adds a new product to the system (Authentication required).
- **Update Product**: `PUT /api/products/{productId}` - Updates an existing product (Authentication required).
- **Delete Product**: `DELETE /api/products/{productId}` - Removes a product from the system (Authentication required).

### Cart

- **Add to Cart**: `POST /api/carts/{productId}` - Adds a product to the user's shopping cart (Authentication required).
- **Remove from Cart**: `DELETE /api/carts/{productId}` - Removes a product from the cart (Authentication required).
- **View Cart**: `GET /api/carts` - Displays all items in the shopping cart (Authentication required).
- **Validate Cart**: `POST /api/carts/validate` - Converts the cart into an order (Authentication required).

### Orders

- **View Orders**: `GET /api/orders` - Retrieves all orders associated with the current user (Authentication required).
- **Order Details**: `GET /api/orders/{orderId}` - Provides detailed information about a specific order (Authentication required).

## Deployment

Deployment is handled using Docker, which simplifies the process into manageable services:

- **PHP Service**: Manages the PHP environment.
- **Web Server Service**: Uses Nginx to serve the application.
- **Database Service**: Runs PostgreSQL for data management.

Use Docker Compose to orchestrate these services. This script will set up each service in its container, ensuring they are interconnected and configured correctly.

## Contributors

- **Etienne Mentrel**
- **Loïc Bravo**
- **Sébastien OGE**

### Shop

https://drive.google.com/file/d/1PZyjjLWGN1XGjszZ-jO77o3HCETA23lS/view?usp=sharing

## The link to the [Github Repository](https://github.com/H1B0B0/Eclatshop)
