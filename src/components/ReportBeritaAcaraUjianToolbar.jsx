import React from "react";
import { GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import baseurl from "../api/baseurl";
// import * as XLSX from "xlsx";

function ReportBeritaAcaraUjianToolbar({ link }) {
  return (
    <GridToolbarContainer
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <a color="primary" href={link}>
          Export to Excel{" "}
        </a>
      </div>

      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

export default ReportBeritaAcaraUjianToolbar;
