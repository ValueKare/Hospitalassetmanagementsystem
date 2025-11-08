import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Building2, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Floor {
  id: number;
  name: string;
  number: string;
  assetCount: number;
  departments: string[];
}

interface Building {
  id: number;
  name: string;
  number: string;
  entity: string;
  floors: Floor[];
  totalAssets: number;
}

interface BuildingFloorHierarchyProps {
  data: Building[];
  selectedBuilding?: number;
  selectedFloor?: number;
  onBuildingSelect?: (buildingId: number) => void;
  onFloorSelect?: (buildingId: number, floorId: number) => void;
}

export function BuildingFloorHierarchy({
  data,
  selectedBuilding,
  selectedFloor,
  onBuildingSelect,
  onFloorSelect,
}: BuildingFloorHierarchyProps) {
  const [expandedBuildings, setExpandedBuildings] = useState<number[]>([]);

  const toggleBuilding = (buildingId: number) => {
    setExpandedBuildings((prev) =>
      prev.includes(buildingId)
        ? prev.filter((id) => id !== buildingId)
        : [...prev, buildingId]
    );
  };

  return (
    <Card className="border-0 shadow-md h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-[#0F67FF]" />
          <span>Building & Floor Hierarchy</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((building) => {
            const isExpanded = expandedBuildings.includes(building.id);
            const isSelected = selectedBuilding === building.id;

            return (
              <div key={building.id} className="space-y-1">
                {/* Building Row */}
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#E8F0FF] border-2 border-[#0F67FF]"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    toggleBuilding(building.id);
                    onBuildingSelect?.(building.id);
                  }}
                >
                  <button
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBuilding(building.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 truncate">{building.name}</p>
                      <Badge className="bg-blue-100 text-blue-800 ml-2">
                        {building.totalAssets} Assets
                      </Badge>
                    </div>
                    <p className="text-gray-500">
                      {building.entity} • {building.floors.length} Floors
                    </p>
                  </div>
                </div>

                {/* Floors List */}
                {isExpanded && (
                  <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-4">
                    {building.floors.map((floor) => {
                      const isFloorSelected = selectedFloor === floor.id;

                      return (
                        <div
                          key={floor.id}
                          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all ${
                            isFloorSelected
                              ? "bg-[#E8F0FF] border border-[#0F67FF]"
                              : "bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => onFloorSelect?.(building.id, floor.id)}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Layers className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-900">{floor.name}</p>
                              <Badge variant="outline" className="ml-2">
                                {floor.assetCount}
                              </Badge>
                            </div>
                            <p className="text-gray-500 truncate">
                              {floor.departments.join(", ")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No buildings found</p>
            <p className="text-gray-400 mt-1">Add a building to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
