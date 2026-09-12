package com.scholartrack.fee;

import com.scholartrack.academic.AcademicDtos.PageDto;
import com.scholartrack.common.ApiResponse;
import com.scholartrack.fee.FeeDtos.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class FeeController {
    private final FeeService svc;
    public FeeController(FeeService svc) { this.svc = svc; }

    // ---- HOD (route group /api/v1/hod/** is HOD-only) ----
    @PostMapping("/hod/fees") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Integer>> createFees(@Valid @RequestBody CreateFeeRequest r) {
        return ApiResponse.ok("Fees created", svc.createFees(r));
    }

    @PostMapping("/hod/fees/{id}/payments") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FeeDto> recordPayment(@PathVariable Long id, @Valid @RequestBody RecordPaymentRequest r, Principal p) {
        return ApiResponse.ok("Payment recorded", svc.recordPayment(p.getName(), id, r));
    }

    @GetMapping("/hod/fees")
    public ApiResponse<PageDto<FeeDto>> list(@RequestParam(required = false) String status,
                                             @RequestParam(defaultValue = "") String q,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok("Fees", svc.listFees(status, q, page, size));
    }

    @GetMapping("/hod/fees/summary")
    public ApiResponse<FeeSummaryDto> summary() { return ApiResponse.ok("Fee summary", svc.summaryForHod()); }

    // ---- Student ----
    @GetMapping("/students/me/fees") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<MyFeesDto> myFees(Principal p) { return ApiResponse.ok("My fees", svc.myFees(p.getName())); }
}
