package menu.q.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.util.HtmlUtils;

public class SanitizedStringValidator implements ConstraintValidator<SanitizedString, String> {

    private int maxLength;
    private boolean allowHtml;

    @Override
    public void initialize(SanitizedString constraintAnnotation) {
        this.maxLength = constraintAnnotation.maxLength();
        this.allowHtml = constraintAnnotation.allowHtml();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true; // Null/empty são tratados por @NotNull/@NotEmpty
        }

        // Verificar tamanho
        if (value.length() > maxLength) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Text is too long (max " + maxLength + " characters)")
                    .addConstraintViolation();
            return false;
        }

        // Se não permitir HTML, verificar caracteres perigosos
        if (!allowHtml) {
            if (containsDangerousCharacters(value)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Text contains potentially dangerous characters")
                        .addConstraintViolation();
                return false;
            }
        }

        return true;
    }

    private boolean containsDangerousCharacters(String value) {
        // Verificar padrões comuns de XSS
        String lowerValue = value.toLowerCase();
        String[] dangerousPatterns = {
            "<script", "javascript:", "onerror=", "onclick=", "onload=",
            "<iframe", "<object", "<embed", "eval(", "expression("
        };

        for (String pattern : dangerousPatterns) {
            if (lowerValue.contains(pattern)) {
                return true;
            }
        }

        return false;
    }

    public static String sanitize(String value) {
        if (value == null) return null;
        return HtmlUtils.htmlEscape(value);
    }
}
