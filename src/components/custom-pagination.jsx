import React from "react";

export function CustomPagination({
  activePage,
  itemsCountPerPage,
  totalItemsCount,
  pageRangeDisplayed = 5,
  onChange,
}) {
  const totalPages = Math.ceil(totalItemsCount / itemsCountPerPage);
  
  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1) return null;
  
  const getVisiblePages = () => {
    const pages = [];
    
    if (totalPages <= pageRangeDisplayed) {
      // Show all pages if total pages is less than or equal to range
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end pages
      let startPage = Math.max(1, activePage - Math.floor(pageRangeDisplayed / 2));
      let endPage = Math.min(totalPages, startPage + pageRangeDisplayed - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage + 1 < pageRangeDisplayed) {
        startPage = Math.max(1, endPage - pageRangeDisplayed + 1);
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis-start');
        }
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis-end');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (activePage - 1) * itemsCountPerPage + 1;
  const endItem = Math.min(activePage * itemsCountPerPage, totalItemsCount);

  return (
    <div className="d-flex flex-column align-items-center mt-4">
      {/* Pagination info */}
      <div className="text-muted mb-3">
        <small>
          Menampilkan {startItem} sampai {endItem} dari {totalItemsCount} hasil
        </small>
      </div>
      
      {/* Pagination controls */}
      <nav aria-label="Pagination">
        <ul className="pagination pagination-sm mb-0">
          {/* Previous button */}
          <li className={`page-item ${activePage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onChange(activePage - 1)}
              disabled={activePage === 1}
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>

          {/* First page if not visible */}
          {visiblePages[0] !== 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => onChange(1)}>
                  1
                </button>
              </li>
              {visiblePages[0] > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}

          {/* Page numbers */}
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <li key={`ellipsis-${index}`} className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              );
            }

            return (
              <li key={page} className={`page-item ${activePage === page ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onChange(page)}
                >
                  {page}
                  {activePage === page && <span className="sr-only">(current)</span>}
                </button>
              </li>
            );
          })}

          {/* Last page if not visible */}
          {visiblePages[visiblePages.length - 1] !== totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button className="page-link" onClick={() => onChange(totalPages)}>
                  {totalPages}
                </button>
              </li>
            </>
          )}

          {/* Next button */}
          <li className={`page-item ${activePage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onChange(activePage + 1)}
              disabled={activePage === totalPages}
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
