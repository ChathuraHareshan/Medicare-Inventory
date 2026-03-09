const URL = "http://192.168.1.5:8080/medicare/api";

export type Medicine = {
    id: number;
    name: string;
    expiryDate: string;
    stock: number;
    price: number;
    status: string;
};

type APIResponse = {
    medicines: Medicine[];
    count: number;
    status: boolean;
    message: string;
    id?: number;
};

export type AddMedicineRequest = {
    name: string;
    expiryDate: string;
    stock: number;
    price: number;
};


export type UpdateMedicineRequest = {
    name?: string;
    expiryDate?: string;
    stock?: number;
    price?: number;
};




export const medicineAPI = {

    getAllMedicines: async (): Promise<Medicine[]> => {
        try {
            console.log("calling API:", `${URL}/medicines/all`);

            const response = await fetch(`${URL}/medicines/all`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`error... status: ${response.status}`);
            }

            const data: APIResponse = await response.json();

            if (data.status === true) {
                console.log(`received.... ${data.count} medicines`);
                return data.medicines;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    addMedicine: async (medicineData: AddMedicineRequest):
        Promise<{ message: string; id?: number }> => {

        try {

            console.log('Data:', medicineData);

            const response = await fetch(`${URL}/medicines/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(medicineData),
            });

            if (!response.ok) {
                throw new Error(`Error... status: ${response.status}`);
            }

            const data = await response.json();
            console.log('response', data);

            if (data.status === true) {
                return {
                    message: data.message,
                    id: data.id,
                };
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },


      updateMedicine: async (id: number, medicineData: UpdateMedicineRequest):
    Promise<{ status: string; message: string }> => {
    try {
        console.log('Data:', medicineData);

        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) {
            throw new Error(`Invalid ID: ${id}`);
        }

        const response = await fetch(`${URL}/medicines/update/${numericId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(medicineData),
        });

        const data = await response.json();
        console.log('Response:', data);

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return {
            status: data.status === true ? "success" : "error",
            message: data.message || "Medicine updated successfully",
        };
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
},


    deleteMedicine: async (id:number):
        Promise<{status: string; message: string}> => {
            try{
                console.log('delete', `${URL}/medicines/delete/${id}`);

                const response = await fetch (`${URL}/medicines/delete/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(`Error... status: ${response.status}`);
                }

                return{
                    status: data.status === true ? "success" : "error",
                    message: data.message || "Medicine deleted successfully",
                };
            }catch(error){
                console.error("API Error:", error);
                throw error;
            }
        },

};

  
