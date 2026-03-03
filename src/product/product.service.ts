import { Injectable } from '@nestjs/common';

interface Product {
    id: number;
    name: string;
    price: number;
}

@Injectable()
export class ProductService {
    private products: Map<number, Product> = new Map();
    createProduct(product: Product) {
        this.products.set(product.id, product);
    }
    getProducts() {
        return Array.from(this.products.values());
    }
    getProductById(id: number) {
        return this.products.get(id)
    }
    deleteProduct(id: number) {
        this.products.delete(id);
    }
    updateProduct(id: number, product: Product) {
        this.products.set(id, product);
    }
    findByName(name: string) {
        return Array.from(this.products.values()).find(product => product.name === name);
    }
    getTotalValue() {
        return Array.from(this.products.values()).reduce((total, product) => total + product.price, 0);
    }
}
