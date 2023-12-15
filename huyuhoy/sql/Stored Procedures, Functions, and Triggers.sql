-- Functions

DELIMITER $$
CREATE FUNCTION CalculateTotalCustomers() RETURNS INT
READS SQL DATA
BEGIN
    DECLARE total_customers INT;
    SELECT COUNT(*) INTO total_customers FROM auth_user WHERE is_superuser = 0;
    RETURN total_customers;
END $$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION `CalculateTotalOrderedMeals`() RETURNS int
READS SQL DATA
BEGIN
    DECLARE total_ordered_meals INT;
    SELECT COUNT(DISTINCT cartitem_id) INTO total_ordered_meals FROM food_cartitem;
    RETURN total_ordered_meals;
END $$
DELIMITER ;

DELIMITER $$
USE `huyuhoydb`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateTotalRevenue`() RETURNS decimal(10,2)
READS SQL DATA
BEGIN
    DECLARE total DECIMAL(10, 2);
    SELECT SUM(amount) INTO total FROM food_payment WHERE payment_status = 'Paid';
    RETURN total;
END$$
DELIMITER ;

-- Functions

-- Procedures

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `AcceptRefuseOrder`(IN orderId INT, IN action VARCHAR(10), IN adminId INT)
BEGIN
    -- Check if the admin exists and is authorized
    DECLARE isAdmin INT;
    DECLARE orderExists INT;
    
    SELECT COUNT(*) INTO isAdmin
    FROM auth_user
    WHERE id = adminId AND is_superuser = 1;

	IF isAdmin = 1 THEN
	-- Check if the order exists
		
        SELECT COUNT(*) INTO orderExists
        FROM food_order
        WHERE id = orderId;

        IF orderExists = 1 THEN
            -- Update the order status based on the action
            IF action = 'Accept' THEN
                UPDATE food_order
                SET status = 'Processing'
                WHERE id = orderId;
            ELSEIF action = 'Refuse' THEN
                UPDATE food_order
                SET status = 'Canceled'
                WHERE id = orderId;
			ELSEIF action = 'Complete' THEN
                UPDATE food_order
                SET status = 'Completed'
                WHERE id = orderId;
            END IF;

            SELECT 'Order ' + action + 'ed successfully' AS result;
        ELSE
            SELECT 'Order not found' AS result;
        END IF;
    ELSE
        SELECT 'Admin not authorized' AS result;
    END IF;
END$$
DELIMITER ;



DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculateTotalBillForCustomer`(IN customerID INT)
BEGIN
    SELECT SUM(bill) AS totalBill
    FROM food_order
    WHERE customer_id = customerID AND status = 'processing';
END$$
DELIMITER ;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CancelCustomerOrder`(IN orderNumber VARCHAR(255), IN customerID INT)
BEGIN
    -- Check if the order exists and is owned by the customer
    DECLARE orderExists INT;
    SELECT COUNT(*) INTO orderExists
    FROM food_order
    WHERE number = orderNumber AND customer_id = customerID;

    -- If the order exists and is owned by the customer, and the status is "Processing" or "Pending," mark it as canceled
    IF orderExists = 1 THEN
        UPDATE food_order
        SET status = 'Canceled'
        WHERE number = orderNumber AND (status = 'Processing' OR status = 'Pending');

        SELECT 'Order canceled successfully' AS result;
    ELSE
        SELECT 'Order not found or you are not the owner' AS result;
    END IF;
END$$
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ConfirmPayment(IN p_payment_id INT)
BEGIN
    DECLARE payment_count INT;

    -- Check if the payment exists
    SELECT COUNT(*)
    INTO payment_count
    FROM food_payment
    WHERE id = p_payment_id;

    -- Check if the payment exists
    IF payment_count = 0 THEN
        -- Update the payment status to 'Failed'
        UPDATE food_payment
        SET payment_status = 'Failed'
        WHERE id = p_payment_id;

        -- Optionally, you can return a message or result
        SELECT 'Payment not found. Status updated to Failed' AS result;
    ELSE
        -- Update the payment status to 'Paid'
        UPDATE food_payment
        SET payment_status = 'Paid'
        WHERE id = p_payment_id;

        -- Optionally, you can return a message or result
        SELECT 'Payment confirmed successfully' AS result;
    END IF;
END //
DELIMITER ;

-- Triggers 

DELIMITER $$
CREATE TRIGGER DeleteAssociatedPayment
AFTER DELETE ON food_order
FOR EACH ROW
BEGIN
    DECLARE paymentIdToDelete INT;

    -- Get the payment_id associated with the deleted order
    SELECT id INTO paymentIdToDelete FROM food_payment WHERE order_id = OLD.id;

    -- If a payment is associated, delete it
    IF paymentIdToDelete IS NOT NULL THEN
        DELETE FROM food_payment WHERE id = paymentIdToDelete;
    END IF;
END;
DELIMITER;

DELIMITER $$
CREATE TRIGGER DeleteAssociatedOrder
AFTER DELETE ON food_payment
FOR EACH ROW
BEGIN
    DECLARE orderIdToDelete INT;

    -- Get the payment_id associated with the deleted order
    SELECT id INTO orderIdToDelete FROM food_order WHERE payment_id  = OLD.id;

    -- If a payment is associated, delete it
    IF orderIdToDelete IS NOT NULL THEN
        DELETE FROM food_order WHERE id = orderIdToDelete;
    END IF;
END;
DELIMITER;

DELIMITER $$
CREATE TRIGGER DeleteAssociatedOrderPayment
AFTER DELETE ON auth_user
FOR EACH ROW
BEGIN
    DECLARE customerIdToDelete INT;

    -- Get the customer_id associated with the deleted user
    SELECT id INTO customerIdToDelete FROM food_order WHERE customer_id = OLD.id;

    -- If user is associated, delete it
    IF customerIdToDelete IS NOT NULL THEN
        DELETE FROM food_order WHERE customer_id = customerIdToDelete;
    END IF;
END;
DELIMITER;

DROP TRIGGER IF EXISTS PreventAdminActionUpdate;
DROP TRIGGER IF EXISTS DeleteAssociatedOrder;





