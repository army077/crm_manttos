import type { DataProvider } from "@refinedev/core";

const API_URL = "https://desarrollotecnologicoar.com/api9";

export const dataProvider: DataProvider = {
    getMany: async ({ resource, ids, meta }) => {
        throw new Error("Not implemented");
    },
    getList: async ({ resource }) => {
        const response = await fetch(`${API_URL}/${resource}`);
        const data = await response.json();
        return { data, total: data.length };
    },

    getOne: async ({ resource, id }) => {
        const response = await fetch(`${API_URL}/${resource}/${id}`);
        const data = await response.json();
        return { data };
    },

    create: async ({ resource, variables }) => {
        const response = await fetch(`${API_URL}/${resource}`, {
            method: "POST",
            body: JSON.stringify(variables),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        return { data };
    },

    update: async ({ resource, id, variables }) => {
        const response = await fetch(`${API_URL}/${resource}/${id}`, {
            method: "PUT",
            body: JSON.stringify(variables),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        return { data };
    },
    deleteOne: () => {
        throw new Error("Not implemented");
    },
    getApiUrl: () => API_URL,
    // Optional methods:
    // getMany: () => { /* ... */ },
    // createMany: () => { /* ... */ },
    // deleteMany: () => { /* ... */ },
    // updateMany: () => { /* ... */ },
    // custom: () => { /* ... */ },
};