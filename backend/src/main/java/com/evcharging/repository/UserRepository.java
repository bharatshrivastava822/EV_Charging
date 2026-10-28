package com.evcharging.repository;

import com.evcharging.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);
    List<User> findByRoleAndOperatorStatus(User.Role role, User.OperatorStatus operatorStatus);
    long countByRoleAndOperatorStatus(User.Role role, User.OperatorStatus operatorStatus);
}
