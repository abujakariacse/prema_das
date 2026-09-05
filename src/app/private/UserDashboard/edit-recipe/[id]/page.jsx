import AddRecipeForm from "@/app/private/UserDashboard/AddRecipe/page"; // একই ফর্মে কল হবে

export default function EditRecipePage() {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <AddRecipeForm />
        </div>
    );
}