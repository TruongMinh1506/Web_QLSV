package com.sms.dto;

import java.util.List;

public record FilterOptionsResponse(
        List<String> faculties,
        List<String> majors,
        List<String> classes
) {
}
