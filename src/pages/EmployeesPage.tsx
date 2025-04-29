
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmployeeSearch } from "@/components/employees/EmployeeSearch";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const EmployeesPage = () => {
  const [isLoading] = useState(false);
  
  const handleSearch = (data: any) => {
    console.log("Search data:", data);
    // Here you would filter employees based on search criteria
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
          <Button className="flex gap-2">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
        
        <div className="space-y-6">
          <EmployeeSearch onSearch={handleSearch} />
          <EmployeeTable isLoading={isLoading} />
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeesPage;
