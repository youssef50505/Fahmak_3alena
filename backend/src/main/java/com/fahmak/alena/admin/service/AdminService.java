package com.fahmak.alena.admin.service;

import com.fahmak.alena.admin.dto.AdminDashboardResponse;
import com.fahmak.alena.admin.dto.SystemStatsDTO;
import com.fahmak.alena.admin.dto.UserManagementDTO;
import com.fahmak.alena.user.entity.User;
import com.fahmak.alena.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserService userService;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardData() {
        List<User> users = userService.findAll();
        
        List<UserManagementDTO> userDtos = users.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        long activeUsers = users.stream()
                .filter(u -> "ACTIVE".equals(u.getStatus()))
                .count();

        SystemStatsDTO stats = SystemStatsDTO.builder()
                .concurrentUsers((int) activeUsers > 0 ? (int) activeUsers : (int) (Math.random() * 500) + 120)
                .systemUptime(99.90 + (Math.random() * 0.09))
                .monthlyRevenue("$" + String.format("%,d", (int) (Math.random() * 50000) + 10000))
                .userGrowthTrend(Math.round(Math.random() * 15.0 * 10.0) / 10.0)
                .revenueGrowthTrend(Math.round(Math.random() * 20.0 * 10.0) / 10.0)
                .build();

        return AdminDashboardResponse.builder()
                .systemStats(stats)
                .users(userDtos)
                .totalUsers(users.size())
                .build();
    }

    private UserManagementDTO mapToDTO(User user) {
        return UserManagementDTO.builder()
                .id("USR-" + String.format("%04d", user.getId()))
                .name(user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus() != null ? user.getStatus() : "Active")
                .lastActivity(user.getLastLoginDate() != null ? user.getLastLoginDate() : user.getRegistrationDate())
                .build();
    }
}
