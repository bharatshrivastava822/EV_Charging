package com.evcharging.service;

import com.evcharging.dto.FeatureDTO;
import com.evcharging.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;

@Service
public class CostEstimatorService {

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("₹#,##0.00");

    public FeatureDTO.CostEstimateResponse calculateEstimate(FeatureDTO.CostEstimateRequest request) {
        if (request.getEnergyKwh() == null || request.getEnergyKwh() <= 0) {
            throw new BadRequestException("Desired energy must be a positive value greater than 0 kWh.");
        }

        double pricePerKwh = request.getPricePerKwh() != null && request.getPricePerKwh() > 0 
                ? request.getPricePerKwh() 
                : 18.50; // benchmark platform default tariff

        double serviceFee = request.getServiceFee() != null && request.getServiceFee() >= 0 
                ? request.getServiceFee() 
                : 15.00; // standard platform & grid connection fee

        double baseCost = Math.round(request.getEnergyKwh() * pricePerKwh * 100.0) / 100.0;
        double totalCost = Math.round((baseCost + serviceFee) * 100.0) / 100.0;

        return FeatureDTO.CostEstimateResponse.builder()
                .energyKwh(request.getEnergyKwh())
                .pricePerKwh(pricePerKwh)
                .baseCostInr(baseCost)
                .serviceFeeInr(serviceFee)
                .totalEstimatedCostInr(totalCost)
                .formattedTotal(CURRENCY_FORMAT.format(totalCost))
                .disclaimer("Notice: This is a pre-charge calculation based on configured station tariffs and standard service fees. Actual session energy delivery may vary based on EV BMS intake temperature and battery state of charge.")
                .build();
    }
}
