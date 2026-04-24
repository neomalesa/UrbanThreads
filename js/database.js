import { db } from "./firebase-config.js";
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Creating data
export let addData = async () => {
    try {
        await addDoc(collection(db, "products"), {   
            name: "Sample Product",
            price: 50,
            category: "Accessories",
            imageURL: "https://example.com/product.jpg",
            description: "A sample product created via code"
        });
        console.log("Product added successfully!");
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// Read data
export let fetchData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
    } catch (error) {
        console.error("Error reading documents: ", error);
    }
} 

// Update data 
export let updateData = async (productId) => {
    if (!productId) return console.log("Please provide a product ID to update.");
    try {
        const docRef = doc(db, "products", productId);
        await updateDoc(docRef, {
            name: "Updated Product",
            price: 200,
            category: "Updated Category"
        });
        console.log("Product updated successfully!");
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

// Delete data 
export let deleteData = async (productId) => {
    if (!productId) return console.log("Please provide a product ID to delete.");
    try {
        const docRef = doc(db, "products", productId);
        await deleteDoc(docRef);
        console.log("Product deleted successfully!");
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
}

// Test fetching data when this script runs
// fetchData();