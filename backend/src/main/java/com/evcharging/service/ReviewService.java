package com.evcharging.service;

import com.evcharging.dto.FeatureDTO;
import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.StationReview;
import com.evcharging.entity.User;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.ChargingStationRepository;
import com.evcharging.repository.StationReviewRepository;
import com.evcharging.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final StationReviewRepository reviewRepository;
    private final ChargingStationRepository stationRepository;
    private final UserRepository userRepository;

    @Transactional
    public FeatureDTO.ReviewResponse submitReview(String userEmail, FeatureDTO.ReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        ChargingStation station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + request.getStationId()));

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be an integer between 1 and 5.");
        }

        StationReview review = StationReview.builder()
                .station(station)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .build();

        StationReview saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FeatureDTO.ReviewResponse> getStationReviews(Long stationId) {
        return reviewRepository.findByStationIdOrderByCreatedAtDesc(stationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FeatureDTO.ReviewResponse mapToResponse(StationReview r) {
        return FeatureDTO.ReviewResponse.builder()
                .id(r.getId())
                .stationId(r.getStation().getId())
                .userName(r.getUser() != null ? r.getUser().getName() : "Anonymous Driver")
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .build();
    }
}
