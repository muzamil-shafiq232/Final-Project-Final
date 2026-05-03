import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Singitronic Admin",
    description: "Singitronic Admin Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
