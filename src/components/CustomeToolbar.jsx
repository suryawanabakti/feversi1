import React from "react";
import { GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import baseurl from "../api/baseurl";
// import * as XLSX from "xlsx";

function CustomToolbar({ prodiId }) {
  return (
    <GridToolbarContainer
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <a
          color="primary"
          href={`${baseurl}/api/residen-lewat-masa-studi/export?prodiId=${
            prodiId ? prodiId : ""
          }`}
        >
          Export to Excel {prodiId}
        </a>
      </div>

      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

export default CustomToolbar;
