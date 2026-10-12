package com.scholartrack.fee;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByFeeIdOrderByPaidAtAsc(Long feeId);
    List<Payment> findByFeeIdInOrderByPaidAtAsc(Collection<Long> feeIds);
}
