declare namespace API {
    type Artwork = {
        id: number;
        name: string;
        cover: string;
        class_id: string;
        price: number;
        quantity: number; // Total quantity issued
        description: string;
        saleable_inventory: number;
        occupied_inventory: number;
        frozen_inventory: number;
        identifier: string; // Unique identifier/Token ID
        state: 'pending' | 'success' | 'archived'; // pending: 待上链/待发布, success: 已发布, archived: 已归档
        sale_time: string;
        sync_chain_time?: string;
        book_start_time?: string;
        book_end_time?: string;
        can_book: number; // 0: No, 1: Yes
        created_at: string;
        updated_at: string;
        creator_id?: string;
    };

    type NFTListParams = {
        current?: number;
        size?: number;
        name?: string;
        identifier?: string;
        state?: string;
    };
}
